import { Injectable } from '@nestjs/common';
import { QueueDomain } from '../domain';

export type SetWaitQueueParam = Pick<
  QueueDomain,
  'uid' | 'concertId' | 'status' | 'userId' | 'timestamp'
>;
export type FindRange = { start: number; stop: number };

@Injectable()
export abstract class QueueRedisClient {
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
  abstract getWaitQueueInfo(queueUid: string): Promise<QueueDomain>;

  /**
   * 대기열에서 내 앞의 대기 인원 계산
   * @returns
   * @exception `ResourceNotFoundException`
   */
  abstract getWaitingNumber(queue: QueueDomain): Promise<number>;

  abstract findActiveQueue(queueUid: string): Promise<QueueDomain>;
  abstract setExActiveQueue(
    queueUid: string,
    queue: QueueDomain,
  ): Promise<void>;
  /**
   * 범위에 지정된 만큼 사용열로 이동
   * - 대기열(ZADD)에서 제거
   * - 사용열(SETEX)에 추가 하고, TTL을 지정한다.
   * @param param
   */
  abstract setActiveQueues(param: FindRange): Promise<void>;

  /**
   * 사용열에 있는 토큰을 제거한다.
   * @param queueUids
   */
  abstract deleteActiveQueue(queueUids: string): Promise<void>;
}
