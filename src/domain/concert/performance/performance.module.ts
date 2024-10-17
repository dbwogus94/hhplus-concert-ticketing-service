import { Module } from '@nestjs/common';

import { PerformanceService } from './domain/performance.service';
import { PerformanceController } from './presentation/performance.controller';
import {
  PerformanceCoreRepository,
  PerformanceRepository,
  ReservationCoreRepository,
  ReservationRepository,
} from './infra';
import { PerformanceFacade } from './application';
import { UserModule } from 'src/domain/user';

@Module({
  imports: [UserModule],
  controllers: [PerformanceController],
  providers: [
    PerformanceFacade,
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
  exports: [PerformanceService],
})
export class PerformanceModule {}
