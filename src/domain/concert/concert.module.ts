import { Module } from '@nestjs/common';
import { PerformanceModule } from './performance/performance.module';
import { ConcertController } from './concert.controller';

@Module({
  imports: [PerformanceModule],
  controllers: [ConcertController],
})
export class ConcertModule {}
