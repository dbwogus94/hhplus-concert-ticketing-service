import { Module } from '@nestjs/common';
import { QueueController } from './presentation/queue.controller';
import { QueueService } from './queue.service';

@Module({
  imports: [],
  controllers: [QueueController],
  providers: [QueueService],
})
export class QueueModule {}
