import { Module } from '@nestjs/common';

import { QueueFacade } from './application';
import { QueueService } from './domain/queue.service';
import {
  ActiveQueueCoreRedis,
  ActiveQueueRedis,
  WaitQueueCoreRedis,
  WaitQueueRedis,
} from './infra';
import { QueueController, QueueSchedule } from './presentation';

@Module({
  imports: [],
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
