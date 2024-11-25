import { Module } from '@nestjs/common';

import { QueueFacade } from './application';
import { QueueService } from './domain/queue.service';
import {
  ActiveQueueCoreRedis,
  ActiveQueueRedis,
  WaitQueueCoreRedis,
  WaitQueueRedis,
} from './infra';
import { QueueConsumer, QueueController, QueueSchedule } from './presentation';

@Module({
  imports: [],
  controllers: [QueueController, QueueSchedule, QueueConsumer],
  providers: [
    QueueFacade,
    QueueService,
    { provide: WaitQueueRedis, useClass: WaitQueueCoreRedis },
    { provide: ActiveQueueRedis, useClass: ActiveQueueCoreRedis },
  ],
  exports: [QueueService],
})
export class QueueModule {}
