import { Injectable } from '@nestjs/common';

import { QueueRepository } from '../infra';
import { QueueEntity, QueueStatus } from './model';
import { CreateQueueInfo, GetQueueInfo, WriteQueueCommand } from './dto';

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
  // TODO: 콘서트 별로 어떻게 돌릴지 고민이 필요하다.
  async batchQueueActiveStatus(activeCount: number): Promise<void> {
    const queues = await this.queueRepo.getQueuesBy({
      where: { status: QueueStatus.WAIT },
      order: { id: 'ASC' },
      take: activeCount,
    });
    if (queues.length === 0) return;

    const updateQueues = queues.map((q) => ({
      ...q,
      status: QueueStatus.ACTIVE,
    }));
    await this.queueRepo.updateQueues(updateQueues);
  }

  // TODO: 제한 시간 만료
  async changeExpireStatusQueues(): Promise<void> {
    // 5분?
  }
}
