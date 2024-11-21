import { Module } from '@nestjs/common';

import { UserModule } from '../user';
import { PerformanceModule } from '../concert/performance';
import { QueueModule } from '../queue';
import {
  ReservationController,
  ReservationEventListener,
} from './presentation';
import { ReservationFacade } from './application';
import { ReservationService, ReservationRepository } from './doamin';
import { ReservationCoreRepository } from './infra';

@Module({
  imports: [UserModule, PerformanceModule, QueueModule],
  controllers: [ReservationController],
  providers: [
    ReservationEventListener,
    ReservationFacade,
    ReservationService,
    {
      provide: ReservationRepository,
      useClass: ReservationCoreRepository,
    },
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
