import { Injectable } from '@nestjs/common';

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
      await this.queueRepo.updateQueue(queue);
    }

    return queue ? FindActiveQueueInfo.of(queue) : null;
  }

  async batchQueueActiveStatus(activeCount: number): Promise<void> {
    const queues = await this.queueRepo.getQueues({
      where: { status: QueueStatus.WAIT },
      order: { id: 'ASC' },
      take: activeCount,
    });
    if (queues.length === 0) return;

    const updateQueues = queues.map((q) =>
      this.queueRepo.create({
        ...q,
        status: QueueStatus.ACTIVE,
        activedAt: new Date(),
      }),
    );
    await this.queueRepo.updateQueues(updateQueues);
  }

  async changeAllExpireStatus(): Promise<void> {
    await this.queueRepo.updateExpireQueues(new Date());
  }
}
