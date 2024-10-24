import { Injectable } from '@nestjs/common';

import { BaseRepository } from 'src/common';
import { QueueEntity } from '../domain';
import { FindManyOptions } from 'typeorm';

export type FindOptions = Pick<FindManyOptions, 'order' | 'take'> & {
  where: FindOptionsWhere;
};
export type FindOptionsWhere = Pick<
  Partial<QueueEntity>,
  'uid' | 'concertId' | 'status'
>;

export type InsertQueueParam = Pick<
  QueueEntity,
  'concertId' | 'uid' | 'status' | 'userId'
>;
export type UpdateQueueParam = Pick<
  Partial<QueueEntity>,
  'status' | 'activeExpireAt' | 'activedAt' | 'activeFirstAccessAt'
>;

@Injectable()
export abstract class QueueRepository extends BaseRepository<QueueEntity> {
  abstract getQueues(options: FindOptions): Promise<QueueEntity[]>;

  abstract getQueueByUid(queueUid: string): Promise<QueueEntity>;
  abstract findQueueBy(options: FindOptionsWhere): Promise<QueueEntity>;
  abstract getWaitingNumber(queueEntity: QueueEntity): Promise<number>;

  abstract saveQueue(param: InsertQueueParam): Promise<QueueEntity>;
  abstract updateQueue(
    queueUid: string,
    param: UpdateQueueParam,
  ): Promise<void>;

  abstract updateQueues(
    queueUids: string[],
    param: UpdateQueueParam,
  ): Promise<void>;

  /** 현재시간 기준 만료시간(activeExpireAt)이 지난 토큰 모두 상태를 "만료"처리 */
  abstract updateAllExpireQueues(date?: Date): Promise<void>;
}
