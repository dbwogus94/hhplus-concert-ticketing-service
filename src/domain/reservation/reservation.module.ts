import { Module } from '@nestjs/common';

import { UserModule } from '../user';
import { PerformanceModule } from '../concert/performance';
import { QueueModule } from '../queue';
import { ReservationController } from './presentation';
import { ReservationFacade } from './application';
import { ReservationService } from './doamin';
import { ReservationCoreRepository, ReservationRepository } from './infra';

@Module({
  imports: [UserModule, PerformanceModule, QueueModule],
  controllers: [ReservationController],
  providers: [
    ReservationFacade,
    ReservationService,
    {
      provide: ReservationRepository,
      useClass: ReservationCoreRepository,
    },
  ],
})
export class ReservationModule {}
