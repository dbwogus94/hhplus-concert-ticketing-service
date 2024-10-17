import { Module } from '@nestjs/common';
import { QueueController } from './presentation/queue.controller';
import { QueueService } from './domain/queue.service';
import { QueueCoreRepository, QueueRepository } from './infra';

@Module({
  imports: [],
  controllers: [QueueController],
  providers: [
    QueueService,
    { provide: QueueRepository, useClass: QueueCoreRepository },
  ],
})
export class QueueModule {}
