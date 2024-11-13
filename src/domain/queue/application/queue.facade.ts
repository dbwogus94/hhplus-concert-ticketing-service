import { Injectable } from '@nestjs/common';
import {
  CreateWaitQueueInfo,
  QueueService,
  WriteWaitQueueCommand,
} from '../domain';
import { AuthService } from 'src/domain/auth';
import { QueueStatusResult } from './dto';

@Injectable()
export class QueueFacade {
  constructor(
    private readonly queueService: QueueService,
    private readonly authService: AuthService,
  ) {}

  async createQueue(
    command: WriteWaitQueueCommand,
  ): Promise<CreateWaitQueueInfo> {
    const query = await this.queueService.createWaitQueue(command);
    return query;
  }

  async getQueueStatus(queueUid: string) {
    const queue = await this.queueService.getWaitQueue(queueUid);

    if (queue.isActive) {
      const accessToken = this.authService.issueToken({
        userId: queue.userId,
        concertId: queue.concertId,
        queueUid: queue.uid,
      });
      return QueueStatusResult.of({ ...queue, accessToken });
    }

    return QueueStatusResult.of(queue);
  }

  async changeQueueActiveStatus(activeCount: number): Promise<void> {
    await this.queueService.batchDeWaitQueuesAndInActiveQueue(activeCount);
  }
}
