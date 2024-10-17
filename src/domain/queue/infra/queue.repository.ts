import { Injectable } from '@nestjs/common';

import { BaseRepository } from 'src/common';
import { QueueEntity } from '../domain';
import { FindManyOptions } from 'typeorm';

export type InsertQueueParam = Pick<
  QueueEntity,
  'concertId' | 'uid' | 'status' | 'userId'
>;

export type FindOptions = Pick<FindManyOptions, 'order' | 'take'> & {
  where: Pick<Partial<QueueEntity>, 'concertId' | 'status'>;
};

@Injectable()
export abstract class QueueRepository extends BaseRepository<QueueEntity> {
  abstract getQueuesBy(options: FindOptions): Promise<QueueEntity[]>;
  abstract getQueueByUid(queueUid: string): Promise<QueueEntity>;
  abstract getWaitingNumber(queueEntity: QueueEntity): Promise<number>;

  abstract saveQueue(param: InsertQueueParam): Promise<QueueEntity>;
  abstract updateQueues(queueEntities: QueueEntity[]): Promise<void>;
}
