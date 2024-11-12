import { Injectable } from '@nestjs/common';

import { WaitQueueDomain } from '../../domain';

export type SetWaitQueueParam = Pick<
  WaitQueueDomain,
  'uid' | 'concertId' | 'status' | 'userId' | 'timestamp'
>;

@Injectable()
export abstract class WaitQueueRedis {
  /**
   * 대기열에 등록
   * - ZADD 를 사용해 Sorted Set으로 저장한다.
   * @param param
   */
  abstract setWaitQueue(param: SetWaitQueueParam): Promise<void>;

  /**
   * 대기열의 토큰 조회
   * @param queueUid
   * @exception `ResourceNotFoundException`
   */
  abstract getWaitQueueInfo(queueUid: string): Promise<WaitQueueDomain>;

  /**
   * 대기열에서 내 앞의 대기 인원 계산
   * @returns
   * @exception `ResourceNotFoundException`
   */
  abstract getWaitingNumber(queue: WaitQueueDomain): Promise<number>;
}
