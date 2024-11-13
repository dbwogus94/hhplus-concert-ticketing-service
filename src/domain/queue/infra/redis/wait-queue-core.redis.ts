import { Injectable } from '@nestjs/common';

import { RedisClient } from 'src/global';
import { WaitQueueDomain } from '../../domain';
import { WaitQueueRedis } from './wait-queue.redis';
import { RedisKeyManager } from './redis-key.manager';

@Injectable()
export class WaitQueueCoreRedis extends WaitQueueRedis {
  /** 대기열 key */

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

    const json = JSON.stringify(param);
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
    const waitingNumber = this.redisClient.zrank(
      waitKey.sort,
      json, // member는 저장했던 데이터와 정확히 일치해야 한다.
    );

    return json && json !== '{}'
      ? WaitQueueDomain.from({ ...(JSON.parse(json) as any), waitingNumber })
      : null;
  }

  override async getWaitingNumber(queue: WaitQueueDomain): Promise<number> {
    const waitKey = RedisKeyManager.getWaitQueueKeyRecord({
      concertId: queue.concertId,
      queueUid: queue.uid,
    });

    const rank = await this.redisClient.zrank(
      waitKey.sort,
      JSON.stringify(queue.prop), // member는 저장했던 데이터와 정확히 일치해야 한다.
    );
    return rank;
  }
}
