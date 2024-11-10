import { Injectable } from '@nestjs/common';

import { QueueRedisClient } from '../infra';
import {
  CreateQueueInfo,
  FindActiveQueueInfo,
  GetQueueInfo,
  WriteQueueCommand,
} from './dto';
import { QueueDomain, QueueEntity, QueueStatus } from './model';

@Injectable()
export class QueueService {
  constructor(private readonly redisClient: QueueRedisClient) {}

  async createQueue(command: WriteQueueCommand): Promise<CreateQueueInfo> {
    const { concertId, userId } = command;
    const param = {
      uid: QueueEntity.generateUUIDv4(),
      userId,
      concertId,
      status: QueueStatus.WAIT,
      timestamp: Date.now(),
    };

    await this.redisClient.setWaitQueue(param);
    return CreateQueueInfo.of(QueueDomain.from(param));
  }

  // TODO: 네이밍 변경 => getWaitQueue
  async getQueue(queueUid: string): Promise<GetQueueInfo> {
    const queue = await this.redisClient.getWaitQueueInfo(queueUid);
    const waitingNumber = await this.redisClient.getWaitingNumber(queue);
    return GetQueueInfo.of({ queue, waitingNumber });
  }

  async findActiveQueue(queueUid: string): Promise<FindActiveQueueInfo | null> {
    const queue = await this.redisClient.findActiveQueue(queueUid);
    if (queue.isFirstAccessAfterActive) {
      queue.firstAccess(new Date());
      await this.redisClient.setExActiveQueue(queue.uid, queue);
    }
    return queue ? FindActiveQueueInfo.of(queue) : null;
  }

  async batchQueueActiveStatus(activeCount: number): Promise<void> {
    await this.redisClient.setActiveQueues({ start: 0, stop: activeCount });
  }

  async expireActiveQueue(queueUid: string) {
    await this.redisClient.deleteActiveQueue(queueUid);
  }
}
