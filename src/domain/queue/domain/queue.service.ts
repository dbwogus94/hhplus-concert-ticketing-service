import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { QueueRepository } from '../infra';
import { QueueEntity, QueueStatus } from './model';
import {
  CreateQueueInfo,
  FindActiveQueueInfo,
  GetQueueInfo,
  WriteQueueCommand,
} from './dto';

@Injectable()
export class QueueService {
  constructor(private readonly queueRepo: QueueRepository) {}

  async createQueue(command: WriteQueueCommand): Promise<CreateQueueInfo> {
    const { concertId, userId } = command;
    const query = await this.queueRepo.saveQueue({
      concertId,
      userId,
      uid: QueueEntity.generateUUIDv4(),
      status: QueueStatus.WAIT,
    });
    return CreateQueueInfo.of(query);
  }

  async getQueue(queueUid: string): Promise<GetQueueInfo> {
    const queue = await this.queueRepo.getQueueByUid(queueUid);
    const waitingNumber = await this.queueRepo.getWaitingNumber(queue);
    return GetQueueInfo.of({ ...queue, waitingNumber });
  }

  async findActiveQueue(queueUid: string): Promise<FindActiveQueueInfo | null> {
    const queue = await this.queueRepo.findOneBy({
      uid: queueUid,
      status: QueueStatus.ACTIVE,
    });
    if (queue.isFirstAccessAfterActive) {
      queue.calculateActiveExpire(new Date());
      await this.queueRepo.updateQueue(queue.uid, queue);
    }

    return queue ? FindActiveQueueInfo.of(queue) : null;
  }

  async batchQueueActiveStatus(activeCount: number): Promise<void> {
    const waitingQueues = await this.queueRepo.getQueues({
      where: { status: QueueStatus.WAIT },
      order: { id: 'ASC' },
      take: activeCount,
    });
    if (waitingQueues.length === 0) return;

    const queueUids = waitingQueues.map((q) => q.uid);
    await this.queueRepo.updateQueues(queueUids, {
      status: QueueStatus.ACTIVE,
      activedAt: new Date(),
    });
  }

  async changeAllExpireStatus(date: Date = new Date()): Promise<void> {
    await this.queueRepo.updateAllExpireQueues(date);
  }

  expireQueue(queueUid: string): (manager?: EntityManager) => Promise<void> {
    return async (manager: EntityManager = null) => {
      const queueRepo = manager
        ? this.queueRepo.createTransactionRepo(manager)
        : this.queueRepo;

      await queueRepo.updateQueue(queueUid, {
        status: QueueStatus.EXPIRE,
      });
    };
  }
}
