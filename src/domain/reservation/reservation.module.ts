import { Module } from '@nestjs/common';
import { ReservationController } from './presentation/reservation.controller';
import { ReservationService } from './doamin/reservation.service';
import { ReservationFacade } from './application';
import { ReservationCoreRepository, ReservationRepository } from './infra';

@Module({
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
