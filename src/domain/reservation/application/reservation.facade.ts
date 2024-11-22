import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { PerformanceService } from 'src/domain/concert/performance';
import { UserService } from 'src/domain/user';
import {
  ReservationService,
  WriteOutboxCommand,
  WriteReservationCommand,
} from '../doamin';
import {
  RequestReservationSyncEvent,
  ReservationEventListener,
} from '../presentation';
import { WriteReservationCriteria } from './criteria';

@Injectable()
export class ReservationFacade {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly performanceService: PerformanceService,
    private readonly userService: UserService,
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async reserve(criteria: WriteReservationCriteria) {
    await this.userService.getUser(criteria.userId);

    const seat = await this.performanceService.getAvailableSeat(
      criteria.seatId,
    );

    return await this.manager.transaction(async (txManager) => {
      const reservation = await this.reservationService.reserve(
        WriteReservationCommand.from({
          userId: criteria.userId,
          performanceId: criteria.performanceId,
          seatId: criteria.seatId,
          price: seat.amount,
        }),
      )(txManager);

      await this.eventEmitter.emitAsync(
        ReservationEventListener.REQUEST_OUTBOX_EVENT,
        RequestReservationSyncEvent.from({
          reservationId: reservation.id,
          payload: JSON.stringify(reservation),
        }),
      );

      return reservation.id;
    });
  }

  async confirm(reservationId: number) {
    const reservation = await this.reservationService.confirm(reservationId);
    return reservation.id;
  }

  async createOutbox(command: WriteOutboxCommand) {
    return this.reservationService.createOutbox(command);
  }

  async emitOutbox(transactionId: number) {
    return this.reservationService.emitOutbox(transactionId);
  }
}
