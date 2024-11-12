import { Injectable } from '@nestjs/common';
import { ActiveQueueDomain, QueueDomain } from '../../domain';

export type FindRange = { start: number; stop: number };

@Injectable()
export abstract class ActiveQueueRedis {
  abstract findActiveQueue(queueUid: string): Promise<ActiveQueueDomain | null>;

  /**
   * 범위에 지정된 만큼 사용열로 이동
   * - 대기열(ZADD)에서 제거
   * - 사용열(SETEX)에 추가 하고, TTL을 지정한다.
   * @param param
   */
  abstract setActiveQueues(param: FindRange): Promise<void>;

  abstract setExActiveQueue(
    queueUid: string,
    queue: QueueDomain,
  ): Promise<void>;

  /**
   * 사용열에 있는 토큰을 제거한다.
   * @param queueUids
   */
  abstract deleteActiveQueue(queueUids: string): Promise<void>;
}
