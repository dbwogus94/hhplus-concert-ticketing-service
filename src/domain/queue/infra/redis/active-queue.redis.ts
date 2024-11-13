import { Injectable } from '@nestjs/common';
import { ActiveQueueDomain } from '../../domain';

export type FindRange = { start: number; stop: number };

@Injectable()
export abstract class ActiveQueueRedis {
  abstract findActiveQueue(queueUid: string): Promise<ActiveQueueDomain | null>;

  /**
   * 범위에 지정된 만큼 사용열로 이동
   * - 대기열(ZADD)에서 제거
   * - 사용열(SETEX)에 추가 하고, TTL을 지정한다.
   * @param consertId
   * @param param
   */
  abstract inActiveQueueWithTx(
    consertId: number,
    param: FindRange,
  ): Promise<void>;

  /**
   * 사용열에 들어 있는 객체에 TTL을 부여한다.
   * @param queue
   */
  abstract setExActiveQueue(queue: ActiveQueueDomain): Promise<void>;

  /**
   * 사용열에 있는 토큰을 제거한다.
   * - *엄밀히게 말하면 큐 구조로 관리하고 있지 않지만 편의상 사용열이라 한다.
   * @param concertId
   * @param queueUid
   */
  abstract deActiveQueue(concertId: number, queueUid: string): Promise<void>;
}
