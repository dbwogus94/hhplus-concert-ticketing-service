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
  /** 사용열 key */
  private readonly ACTIVE_USERS_KEY = 'active:users';

  constructor(private readonly redisClient: RedisClient) {
    super();
  }

  override async setWaitQueue(param: SetWaitQueueParam): Promise<void> {
    const multi = this.redisClient.multi();
    // 대기열 정보
    multi.hmset(param.uid, param);

    // 대기열 순서
    multi.zadd(
      this.WAITING_QUEUE_KEY,
      param.timestamp,
      JSON.stringify({ ...param }),
    );
    await multi.exec();
  }

  override async getWaitQueue(queueUid: string): Promise<QueueDomain> {
    const record = await this.redisClient.hgetall(queueUid);
    if (!record) throw new ResourceNotFoundException();
    return QueueDomain.from(record as any);
  }

  override async getWaitingNumber(queue: QueueDomain): Promise<number> {
    const rank = await this.redisClient.zrank(
      this.WAITING_QUEUE_KEY,
      JSON.stringify(queue), // member는 저장했던 데이터와 정확히 일치해야 한다.
    );
    return rank;
  }

  override async findActiveQueue(queueUid: string): Promise<QueueDomain> {
    const record = await this.redisClient.get(queueUid);
    return QueueDomain.from(JSON.parse(record));
  }

  override async setExActiveQueue(
    queueUid: string,
    queue: QueueDomain,
  ): Promise<void> {
    // 만료시간 설정
    this.redisClient.setEX(queueUid, JSON.stringify(queue), {
      ttlSeconds: QueueDomain.MAX_ACTIVE_MINUTE,
    });
  }

  override async setActiveQueues(range: FindRange): Promise<void> {
    // 1. 대기열에서 조회
    const members = await this.redisClient.zrange(
      this.WAITING_QUEUE_KEY,
      range.start,
      range.stop - 1,
    );
    if (members.length === 0) return;

    // redis 트랜잭션
    const multi = this.redisClient.multi();
    members.forEach((member) => {
      // 2. 활성 사용자로 등록
      const queue = QueueDomain.from(JSON.parse(member)).active();
      multi.set(
        `${this.ACTIVE_USERS_KEY}:${queue.uid}`, // active:users:${queueUid}
        JSON.stringify(queue),
      );
      // 3. 대기열에서 제거
      multi.zrem(this.WAITING_QUEUE_KEY, member);
    });

    // 한번에 전송
    await multi.exec();
  }

  override async deleteActiveQueue(queueUids: string): Promise<void> {
    await this.redisClient.del(`${this.ACTIVE_USERS_KEY}:${queueUids}`);
  }
}
