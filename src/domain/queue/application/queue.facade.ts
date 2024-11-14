import { Injectable } from '@nestjs/common';
import {
  CreateWaitQueueInfo,
  QueueService,
  WriteWaitQueueCommand,
} from '../domain';
import { QueueStatusResult } from './dto';
import { ResourceNotFoundException } from 'src/common';

@Injectable()
export class QueueFacade {
  constructor(private readonly queueService: QueueService) {}

  async createQueue(
    command: WriteWaitQueueCommand,
  ): Promise<CreateWaitQueueInfo> {
    const query = await this.queueService.createWaitQueue(command);
    return query;
  }

  async getQueueStatus(queueUid: string) {
    const waitQueue = await this.queueService.findWaitQueue(queueUid);
    if (waitQueue) {
      return QueueStatusResult.of(waitQueue);
    }

    const activeQueue = await this.queueService.findActiveQueue(queueUid);
    if (!activeQueue) {
      throw new ResourceNotFoundException('대기 상태의 토큰이 없습니다.');
    }

    return QueueStatusResult.of({
      status: activeQueue.status,
      waitingNumber: 0,
      accessToken: activeQueue.uid,
    });
  }

  async changeQueueActiveStatus(activeCount: number): Promise<void> {
    await this.queueService.batchDeWaitQueuesAndInActiveQueue(activeCount);
  }
}
