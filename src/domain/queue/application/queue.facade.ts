import { Injectable } from '@nestjs/common';
import {
  CreateQueueInfo,
  QueueService,
  QueueStatus,
  WriteQueueCommand,
} from '../domain';
import { AuthService } from 'src/domain/auth';
import { QueueStatusResult } from './dto';

@Injectable()
export class QueueFacade {
  constructor(
    private readonly queueService: QueueService,
    private readonly authService: AuthService,
  ) {}

  async createQueue(command: WriteQueueCommand): Promise<CreateQueueInfo> {
    const query = await this.queueService.createQueue(command);
    return query;
  }

  async getQueueStatus(queueUid: string) {
    const queue = await this.queueService.getQueue(queueUid);

    if (queue.status === QueueStatus.WAIT) {
      const jwt = this.authService.issueToken({
        queueUid: queue.uid,
        userId: queue.userId,
      });
      return QueueStatusResult.of({ ...queue, jwt });
    }

    return QueueStatusResult.of(queue);
  }

  async changeQueueActiveStatus(activeCount: number): Promise<void> {
    await this.queueService.batchQueueActiveStatus(activeCount);
  }

  async changeQueueExpireStatus(): Promise<void> {
    await this.queueService.changeExpireStatusQueues();
  }
}
