import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  BookingSeatEvent,
  PerformanceEventListener,
  PerformanceService,
} from 'src/domain/concert/performance';
import { UserService } from 'src/domain/user';
import { ReservationService, WriteReservationCommand } from '../doamin';
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async reserve(criteria: WriteReservationCriteria) {
    await this.userService.getUser(criteria.userId);

    const seat = await this.performanceService.getAvailableSeat(
      criteria.userId,
    );

    const reservation = await this.reservationService.reserve(
      WriteReservationCommand.from({
        userId: criteria.userId,
        performanceId: criteria.performanceId,
        seatId: criteria.seatId,
        price: seat.amount,
      }),
    );

    this.eventEmitter.emit(
      ReservationEventListener.REQUEST_EVENT,
      RequestReservationSyncEvent.from({
        reservationId: reservation.id,
        payload: JSON.stringify(reservation),
      }),
    );

    // // 좌석 임시 예약 이벤트
    // this.eventEmitter.emit(
    //   PerformanceEventListener.RESERVE_SEAT_EVENT,
    //   ReserveSeatEvent.from({ seatId: seat.id }),
    // );

    // // 큐 만료 이벤트 발생
    // this.eventEmitter.emit(
    //   QueueEventListener.EXPIRE,
    //   ExpireQueueEvent.from({ queueUid: criteria.queueUid }),
    // );
    return reservation.id;
  }

  async confirm(reservationId: number) {
    const reservation = await this.reservationService.confirm(reservationId);

    // 좌석 예약 확정 이벤트
    this.eventEmitter.emit(
      PerformanceEventListener.BOOKING_SEAT_EVENT,
      BookingSeatEvent.from({ seatId: reservation.seatId }),
    );
    return reservation.id;
  }
}
