import { Injectable } from '@nestjs/common';

import { RedisClient } from 'src/global';
import { WaitQueueDomain } from '../../domain';
import { FindRange, WaitQueueRedis } from './wait-queue.redis';
import { RedisKeyManager } from './redis-key.manager';

@Injectable()
export class WaitQueueCoreRedis extends WaitQueueRedis {
  constructor(private readonly redisClient: RedisClient) {
    super();
  }

  // Note: 하나의 자료구조로 어떻게 관리할까?
  override async inWaitQueue(param: WaitQueueDomain): Promise<void> {
    const { concertId, uid: queueUid } = param;
    const waitKey = RedisKeyManager.getWaitQueueKeyRecord({
      concertId,
      queueUid,
    });

    const json = JSON.stringify(param.prop);
    await this.redisClient
      .multi()
      // 대기열 순서
      .zadd(waitKey.sort, param.timestamp, json)
      // 대기열 정보
      .hset(waitKey.info, { info: json })
      .exec();
  }

  override async findWaitQueue(
    concertId: number,
    queueUid: string,
  ): Promise<WaitQueueDomain> {
    const waitKey = RedisKeyManager.getWaitQueueKeyRecord({
      concertId,
      queueUid,
    });

    const json = await this.redisClient.hget(waitKey.info, 'info');
    const waitingNumber = await this.redisClient.zrank(
      waitKey.sort,
      json, // member는 저장했던 데이터와 정확히 일치해야 한다.
    );

    return json && json !== '{}'
      ? WaitQueueDomain.from({ ...(JSON.parse(json) as any), waitingNumber })
      : null;
  }

  async getWaitQueues(
    consertId: number,
    range: FindRange,
  ): Promise<WaitQueueDomain[]> {
    const sortkey = RedisKeyManager.getWaitQueueSortKey(consertId);
    const members = await this.redisClient.zrange(
      sortkey,
      range.start,
      range.stop - 1, // 인덱스 0부터 시작 보정
    );
    return members.length > 0
      ? members.map((m) => WaitQueueDomain.from(JSON.parse(m)))
      : [];
  }

  async deWaitQueueWithTx(waitQueues: WaitQueueDomain[]): Promise<void> {
    const multi = this.redisClient.multi();

    waitQueues.forEach((queue) => {
      const waitRecord = RedisKeyManager.getWaitQueueKeyRecord({
        concertId: queue.concertId,
        queueUid: queue.uid,
      });

      multi.zrem(waitRecord.sort, JSON.stringify(queue.toLiteral()));
      multi.del(waitRecord.info);
    });

    // 한번에 전송
    await multi.exec();
  }
}
