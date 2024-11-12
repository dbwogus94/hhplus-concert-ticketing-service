import { Injectable } from '@nestjs/common';

import { RedisClient } from 'src/global';
import { ActiveQueueDomain, WaitQueueDomain } from '../../domain';
import { ActiveQueueRedis, FindRange } from './active-queue.redis';

@Injectable()
export class ActiveQueueCoreRedis extends ActiveQueueRedis {
  /** 대기열 key */
  private readonly WAITING_QUEUE_KEY = 'waiting:queue';
  private readonly WAITING_INFO_KEY = 'waiting:info';
  /** 사용열 key */
  private readonly ACTIVE_USERS_KEY = 'active:users';

  constructor(private readonly redisClient: RedisClient) {
    super();
  }

  override async findActiveQueue(
    queueUid: any,
  ): Promise<ActiveQueueDomain | null> {
    const json = await this.redisClient.get(queueUid);
    return json ? ActiveQueueDomain.from(JSON.parse(json)) : null;
  }

  override async setActiveQueues(range: FindRange): Promise<void> {
    // 1. 대기열에서 조회
    const members = await this.redisClient.zrange(
      this.WAITING_QUEUE_KEY,
      range.start,
      range.stop - 1, // 인덱스 0부터 시작 보정
    );
    if (members.length === 0) return;

    // redis 한번에 전송하기 위한 설정
    const multi = this.redisClient.multi();
    members.forEach((member) => {
      // 2. 활성 사용자로 등록
      const queue = ActiveQueueDomain.from(JSON.parse(member)).active();
      multi.set(
        `${this.ACTIVE_USERS_KEY}:${queue.uid}`, // active:users:${queueUid}
        member,
      );

      // 3. 대기열에서 제거
      multi.zrem(this.WAITING_QUEUE_KEY, member);
      multi.del(`${this.WAITING_INFO_KEY}:${queue.uid}`);
    });

    // 한번에 전송
    await multi.exec();
  }

  override async setExActiveQueue(
    queueUid: string,
    queue: WaitQueueDomain,
  ): Promise<void> {
    // 만료시간 설정
    this.redisClient.setEX(
      `${this.ACTIVE_USERS_KEY}:${queueUid}`,
      JSON.stringify(queue),
      {
        ttlSeconds: ActiveQueueDomain.MAX_ACTIVE_MINUTE,
      },
    );
  }

  override async deleteActiveQueue(queueUid: string): Promise<void> {
    await this.redisClient.del(`${this.ACTIVE_USERS_KEY}:${queueUid}`);
  }
}
