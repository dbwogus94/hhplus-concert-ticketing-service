import { Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { QueueController, QueueSchedule } from './presentation';
import { QueueFacade } from './application';
import { QueueService } from './domain/queue.service';
import {
  ActiveQueueCoreRedis,
  ActiveQueueRedis,
  WaitQueueCoreRedis,
  WaitQueueRedis,
} from './infra';

@Module({
  imports: [AuthModule],
  controllers: [QueueController],
  providers: [
    QueueSchedule,
    QueueFacade,
    QueueService,
    { provide: WaitQueueRedis, useClass: WaitQueueCoreRedis },
    { provide: ActiveQueueRedis, useClass: ActiveQueueCoreRedis },
  ],
  exports: [QueueService],
})
export class QueueModule {}
