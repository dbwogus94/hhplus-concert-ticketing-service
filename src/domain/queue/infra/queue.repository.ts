import { Injectable } from '@nestjs/common';

import { BaseRepository } from 'src/common';
import { QueueEntity } from '../domain';

export type InsertQueueParam = Pick<
  QueueEntity,
  'concertId' | 'uid' | 'status' | 'userId'
>;

@Injectable()
export abstract class QueueRepository extends BaseRepository<QueueEntity> {
  abstract saveQueue(param: InsertQueueParam): Promise<QueueEntity>;
  abstract getQueueByUid(queueUid: string): Promise<QueueEntity>;
  abstract getWaitingNumber(queueEntity: QueueEntity): Promise<number>;
}
