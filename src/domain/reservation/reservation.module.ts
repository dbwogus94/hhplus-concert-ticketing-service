import { Module } from '@nestjs/common';

import { UserModule } from '../user';
import { PerformanceModule } from '../concert/performance';
import { QueueModule } from '../queue';
import {
  ReservationController,
  ReservationEventListener,
} from './presentation';
import { ReservationFacade } from './application';
import {
  ReservationService,
  ReservationRepository,
  ReservationProducer,
} from './doamin';
import { ReservationCoreProducer, ReservationCoreRepository } from './infra';

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
    {
      provide: ReservationProducer,
      useClass: ReservationCoreProducer,
    },
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
