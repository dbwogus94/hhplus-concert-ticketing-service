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
}
