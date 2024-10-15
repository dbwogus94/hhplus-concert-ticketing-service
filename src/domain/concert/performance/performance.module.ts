import { Module } from '@nestjs/common';

import { PerformanceService } from './domain/performance.service';
import { PerformanceController } from './presentation/performance.controller';
import {
  PerformanceCoreRepository,
  PerformanceRepository,
  ReservationCoreRepository,
  ReservationRepository,
} from './infra';

@Module({
  controllers: [PerformanceController],
  providers: [
    PerformanceService,
    {
      provide: PerformanceRepository,
      useClass: PerformanceCoreRepository,
    },
    {
      provide: ReservationRepository,
      useClass: ReservationCoreRepository,
    },
  ],
})
export class PerformanceModule {}
