import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common';
import { RedisClient } from 'src/global';
import { QueueDomain } from '../domain';
import {
  FindRange,
  QueueRedisClient,
  SetWaitQueueParam,
} from './queue-redis.client';

// TODO: ActiveQueue와 WaitQueue로 나누고 전반적인 리펙터링 예정
@Injectable()
export class QueueCoreRedisClient extends QueueRedisClient {
  /** 대기열 key */
  private readonly WAITING_QUEUE_KEY = 'waiting:queue';
  private readonly WAITING_INFO_KEY = 'waiting:info';
  /** 사용열 key */
  private readonly ACTIVE_USERS_KEY = 'active:users';

  constructor(private readonly redisClient: RedisClient) {
    super();
  }

  // Note: 하나의 자료구조로 어떻게 관리할까?
  override async setWaitQueue(param: SetWaitQueueParam): Promise<void> {
    const multi = this.redisClient.multi();
    const json = JSON.stringify(param);

    // 대기열 순서
    multi.zadd(`${this.WAITING_QUEUE_KEY}`, param.timestamp, json);
    // 대기열 정보
    multi.hset(`${this.WAITING_INFO_KEY}:${param.uid}`, { info: json });
    await multi.exec();
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

  override async findActiveQueue(queueUid: string): Promise<QueueDomain> {
    const record = await this.redisClient.get(
      `${this.ACTIVE_USERS_KEY}:${queueUid}`,
    );
    return record ? QueueDomain.from(JSON.parse(record)) : null;
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
      const queue = QueueDomain.from(JSON.parse(member)).active();
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
    queue: QueueDomain,
  ): Promise<void> {
    // 만료시간 설정
    this.redisClient.setEX(
      `${this.ACTIVE_USERS_KEY}:${queueUid}`,
      JSON.stringify(queue),
      {
        ttlSeconds: QueueDomain.MAX_ACTIVE_MINUTE,
      },
    );
  }

  override async deleteActiveQueue(queueUids: string): Promise<void> {
    await this.redisClient.del(`${this.ACTIVE_USERS_KEY}:${queueUids}`);
  }
}
