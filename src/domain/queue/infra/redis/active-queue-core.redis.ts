import { Injectable } from '@nestjs/common';

import { RedisClient } from 'src/global';
import { ActiveQueueDomain } from '../../domain';
import { ActiveQueueRedis } from './active-queue.redis';
import { RedisKeyManager } from './redis-key.manager';

@Injectable()
export class ActiveQueueCoreRedis extends ActiveQueueRedis {
  constructor(private readonly redisClient: RedisClient) {
    super();
  }

  override async findActiveQueue(
    concertId: number,
    queueUid: string,
  ): Promise<ActiveQueueDomain | null> {
    const key = RedisKeyManager.getActiveQueueInfoKey({ concertId, queueUid });
    const json = await this.redisClient.get(key);
    return json ? ActiveQueueDomain.from(JSON.parse(json)) : null;
  }

  override async inActiveQueuesWithTx(
    activeQueues: ActiveQueueDomain[],
  ): Promise<void> {
    // redis 트랜잭션
    const multi = this.redisClient.multi();
    activeQueues.forEach((queue) => {
      const activeInfoKey = RedisKeyManager.getActiveQueueInfoKey({
        concertId: queue.concertId,
        queueUid: queue.uid,
      });
      queue.active();

      // 2. 활성 사용자로 등록
      multi.set(activeInfoKey, JSON.stringify(queue.toLiteral()));
    });

    // 한번에 전송
    await multi.exec();
  }

  override async reInActiveQueueWithTTL(
    queue: ActiveQueueDomain,
  ): Promise<void> {
    const activetkey = RedisKeyManager.getActiveQueueInfoKey({
      concertId: queue.concertId,
      queueUid: queue.uid,
    });

    await this.redisClient.setEX(activetkey, JSON.stringify(queue), {
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
