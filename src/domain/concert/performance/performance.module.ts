import { Module } from '@nestjs/common';

import { PerformanceService } from './domain/performance.service';
import { PerformanceController } from './presentation/performance.controller';

@Module({
  controllers: [PerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}
