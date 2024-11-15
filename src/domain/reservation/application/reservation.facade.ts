import { Injectable } from '@nestjs/common';

import { UserService } from 'src/domain/user';
import { ReservationService } from '../doamin/reservation.service';
import { WriteReservationCriteria } from './criteria';
import {
  PerformanceEventListener,
  PerformanceService,
  ReserveSeatEvent,
} from 'src/domain/concert/performance';
import { WriteReservationCommand } from '../doamin';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExpireQueueEvent, QueueEventListener } from 'src/domain/queue';

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

    const seat = await this.performanceService.getReserveSeat(criteria.userId);

    const reservationId = await this.reservationService.reserve(
      WriteReservationCommand.from({
        userId: criteria.userId,
        performanceId: criteria.performanceId,
        seatId: criteria.seatId,
        price: seat.amount,
      }),
    );

    // 좌석 변경 이벤트
    this.eventEmitter.emit(
      PerformanceEventListener.RESERVE_SEAT_EVENT,
      ReserveSeatEvent.from({ seatId: seat.id }),
    );

    // 큐 만료 이벤트 발생
    this.eventEmitter.emit(
      QueueEventListener.EXPIRE,
      ExpireQueueEvent.from({ queueUid: criteria.queueUid }),
    );
    return reservationId;
  }
}
