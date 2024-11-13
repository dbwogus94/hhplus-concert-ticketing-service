import { Injectable } from '@nestjs/common';

import { RedisClient } from 'src/global';
import { ActiveQueueDomain } from '../../domain';
import { ActiveQueueRedis, FindRange } from './active-queue.redis';
import { RedisKeyManager } from './redis-key.manager';

@Injectable()
export class ActiveQueueCoreRedis extends ActiveQueueRedis {
  constructor(private readonly redisClient: RedisClient) {
    super();
  }

  override async findActiveQueue(
    queueUid: string,
  ): Promise<ActiveQueueDomain | null> {
    const json = await this.redisClient.get(queueUid);
    return json ? ActiveQueueDomain.from(JSON.parse(json)) : null;
  }

  override async inActiveQueueWithTx(
    consertId: number,
    range: FindRange,
  ): Promise<void> {
    const sortkey = RedisKeyManager.getWaitQueueSortKey(consertId);

    // 1. 대기열에서 조회
    const members = await this.redisClient.zrange(
      sortkey,
      range.start,
      range.stop - 1, // 인덱스 0부터 시작 보정
    );
    if (members.length === 0) return;

    // redis 트랜잭션
    const multi = this.redisClient.multi();
    members.forEach((member) => {
      const waitQueue = JSON.parse(member);
      waitQueue.active();

      const waitRecord = RedisKeyManager.getWaitQueueKeyRecord({
        concertId: waitQueue.concertId,
        queueUid: waitQueue.uid,
      });

      const activeInfoKey = RedisKeyManager.getActiveQueueInfoKey({
        concertId: waitQueue.concertId,
        queueUid: waitQueue.uid,
      });

      // 2. 활성 사용자로 등록
      multi.set(activeInfoKey, member);

      // 3. 대기열에서 제거
      multi.zrem(waitRecord.sort, member);
      multi.del(waitRecord.info);
    });

    // 한번에 전송
    await multi.exec();
  }

  override async setExActiveQueue(queue: ActiveQueueDomain): Promise<void> {
    const activetkey = RedisKeyManager.getActiveQueueInfoKey({
      concertId: queue.concertId,
      queueUid: queue.uid,
    });

    // 만료시간 설정
    this.redisClient.expire(activetkey, {
      ttlSeconds: ActiveQueueDomain.MAX_ACTIVE_MINUTE,
    });
  }

  override async deActiveQueue(
    concertId: number,
    queueUid: string,
  ): Promise<void> {
    const activetkey = RedisKeyManager.getActiveQueueInfoKey({
      concertId,
      queueUid,
    });

    await this.redisClient.del(activetkey);
  }
}
