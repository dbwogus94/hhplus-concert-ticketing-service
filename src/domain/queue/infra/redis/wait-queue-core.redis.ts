import { Injectable } from '@nestjs/common';

import { ResourceNotFoundException } from 'src/common';
import { RedisClient } from 'src/global';
import { SetWaitQueueParam, WaitQueueRedis } from './wait-queue.redis';
import { QueueDomain } from '../../domain';

@Injectable()
export class WaitQueueCoreRedis extends WaitQueueRedis {
  /** 대기열 key */
  private readonly WAITING_QUEUE_KEY = 'waiting:queue';
  private readonly WAITING_INFO_KEY = 'waiting:info';

  constructor(private readonly redisClient: RedisClient) {
    super();
  }

  // Note: 하나의 자료구조로 어떻게 관리할까?
  override async setWaitQueue(param: SetWaitQueueParam): Promise<void> {
    const json = JSON.stringify(param);

    await this.redisClient
      .multi()
      // 대기열 순서
      .zadd(`${this.WAITING_QUEUE_KEY}`, param.timestamp, json)
      // 대기열 정보
      .hset(`${this.WAITING_INFO_KEY}:${param.uid}`, { info: json })
      .exec();
  }

  override async getWaitQueueInfo(queueUid: string): Promise<QueueDomain> {
    const json = await this.redisClient.hget(
      `${this.WAITING_INFO_KEY}:${queueUid}`,
      'info',
    );
    const queueRecord = JSON.parse(json);

    if (!queueRecord || Object.keys(queueRecord).length === 0)
      throw new ResourceNotFoundException();
    return QueueDomain.from(queueRecord as any);
  }

  override async getWaitingNumber(queue: QueueDomain): Promise<number> {
    const rank = await this.redisClient.zrank(
      this.WAITING_QUEUE_KEY,
      JSON.stringify(queue.prop), // member는 저장했던 데이터와 정확히 일치해야 한다.
    );
    if (rank === -1) throw new ResourceNotFoundException();
    return rank;
  }
}
