import { Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { QueueFacade } from './application';
import { QueueService } from './domain/queue.service';
import { QueueCoreRedisClient, QueueRedisClient } from './infra';
import { QueueController, QueueSchedule } from './presentation';

@Module({
  imports: [AuthModule],
  controllers: [QueueController],
  providers: [
    QueueSchedule,
    QueueFacade,
    QueueService,
    { provide: QueueRedisClient, useClass: QueueCoreRedisClient },
  ],
  exports: [QueueService],
})
export class QueueModule {}
