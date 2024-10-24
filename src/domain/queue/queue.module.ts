import { Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { QueueFacade } from './application';
import { QueueService } from './domain/queue.service';
import { QueueCoreRepository, QueueRepository } from './infra';
import { QueueController, QueueSchedule } from './presentation';

@Module({
  imports: [AuthModule],
  controllers: [QueueController],
  providers: [
    QueueSchedule,
    QueueFacade,
    QueueService,
    { provide: QueueRepository, useClass: QueueCoreRepository },
  ],
  exports: [QueueService],
})
export class QueueModule {}
