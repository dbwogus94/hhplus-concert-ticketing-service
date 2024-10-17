import { Injectable } from '@nestjs/common';

import {
  FindOptions,
  InsertQueueParam,
  QueueRepository,
} from './queue.repository';
import { EntityManager } from 'typeorm';
import { QueueEntity, QueueStatus } from '../domain';
import { ResourceNotFoundException } from 'src/common';

@Injectable()
export class QueueCoreRepository extends QueueRepository {
  constructor(readonly manager: EntityManager) {
    super(QueueEntity, manager);
  }

  override async getQueuesBy(options: FindOptions): Promise<QueueEntity[]> {
    return await this.find({ ...options });
  }

  override async getQueueByUid(queueUid: string): Promise<QueueEntity> {
    const queue = await this.findOneBy({ uid: queueUid });
    if (!queue) throw new ResourceNotFoundException();
    return queue;
  }

  override async getWaitingNumber(queueEntity: QueueEntity): Promise<number> {
    const { uid, createdAt, concertId } = queueEntity;
    const count = await this.createQueryBuilder('q')
      .select('q.id')
      .where('q.uid = :queueUid', { uid })
      .andWhere('q.concertId = :concertId', { concertId })
      .andWhere('q.status = :status', { status: QueueStatus.WAIT })
      .andWhere('q.createdAt > :createdAt', { createdAt })
      .getCount();

    return count + 1;
  }

  override async saveQueue(param: InsertQueueParam): Promise<QueueEntity> {
    const quque = this.create({ ...param, status: QueueStatus.WAIT });
    return await this.save({
      quque,
      uid: QueueEntity.generateUUIDv4(),
    });
  }
  override async updateQueues(queueEntities: QueueEntity[]): Promise<void> {
    await this.manager.transaction(async (txManager) => {
      await Promise.all(
        queueEntities.map(async (queue) => {
          await txManager.update(QueueEntity, queue.id, { ...queue });
        }),
      );
    });
  }
}
