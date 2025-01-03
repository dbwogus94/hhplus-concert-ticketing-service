import { Injectable } from '@nestjs/common';
import { ActiveQueueDomain } from '../../domain';

@Injectable()
export abstract class ActiveQueueRedis {
  abstract findActiveQueue(
    concertId: number,
    queueUid: string,
  ): Promise<ActiveQueueDomain | null>;

  abstract inActiveQueuesWithTx(
    activeQueues: ActiveQueueDomain[],
  ): Promise<void>;

  /**
   * 사용열에 값을 다시 부여한다. TTL을 부여한다.
   * - set + EX + NX 사용
   * @param queue
   */
  abstract reInActiveQueueWithTTL(queue: ActiveQueueDomain): Promise<void>;

  /**
   * 사용열에 있는 토큰을 제거한다.
   * - *엄밀히게 말하면 큐 구조로 관리하고 있지 않지만 편의상 사용열이라 한다.
   * @param concertId
   * @param queueUid
   */
  abstract deActiveQueue(concertId: number, queueUid: string): Promise<void>;
}
