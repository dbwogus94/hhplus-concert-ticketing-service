import { Module } from '@nestjs/common';

import { PerformanceService } from './performance.service';

@Module({
  controllers: [],
  providers: [PerformanceService],
})
export class PerformanceModule {}
