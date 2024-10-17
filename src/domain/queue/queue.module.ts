import { Module } from '@nestjs/common';
import { QueueController } from './presentation/queue.controller';
import { QueueService } from './domain/queue.service';
import { QueueCoreRepository, QueueRepository } from './infra';
import { QueueFacade } from './application';
import { QueueSchedule } from './presentation';
import { AuthModule } from '../auth';

@Module({
  imports: [AuthModule],
  controllers: [QueueController],
  providers: [
    QueueSchedule,
    QueueFacade,
    QueueService,
    { provide: QueueRepository, useClass: QueueCoreRepository },
  ],
})
export class QueueModule {}
