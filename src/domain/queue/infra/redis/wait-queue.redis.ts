import { Injectable } from '@nestjs/common';

import { WaitQueueDomain } from '../../domain';

export type SetWaitQueueParam = Pick<
  WaitQueueDomain,
  'uid' | 'concertId' | 'status' | 'userId' | 'timestamp'
>;

export type FindRange = { start: number; stop: number };

@Injectable()
export abstract class WaitQueueRedis {
  /**
   * 대기열에 등록
   * - ZADD 를 사용해 Sorted Set으로 저장한다.
   * @param param
   */
  abstract inWaitQueue(param: SetWaitQueueParam): Promise<void>;

  /**
   * 대기열의 토큰 조회
   * @param queueUid
   */
  abstract findWaitQueue(
    concertId: number,
    queueUid: string,
  ): Promise<WaitQueueDomain>;

  abstract getWaitQueues(
    concertId: number,
    range: FindRange,
  ): Promise<WaitQueueDomain[]>;

  abstract deWaitQueueWithTx(waitQueues: WaitQueueDomain[]): Promise<void>;
}
