import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  BaseEventListener,
  CustomLoggerService,
  OnCustomEvent,
  OnCustomEventErrorHandler,
} from 'src/global';
import { BookingSeatEvent, ReserveSeatEvent } from './event';
import { PerformanceFacade } from '../application';

@Injectable()
export class PerformanceEventListener extends BaseEventListener {
  static readonly EVENT_GROUP = 'perfromance';
  static readonly RESERVE_SEAT_EVENT = 'perfromance.reserveSeat';
  static readonly BOOKING_SEAT_EVENT = 'perfromance.bookingSeat';

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly performanceFacade: PerformanceFacade,
    eventEmitter: EventEmitter2,
  ) {
    super(PerformanceEventListener.EVENT_GROUP, eventEmitter);
    this.logger.setTarget(this.constructor.name);
  }

  /**
   * 좌석 임시예약
   * @param event
   */
  @OnCustomEvent(PerformanceEventListener.RESERVE_SEAT_EVENT, { async: true })
  async handleReserveSeat(event: ReserveSeatEvent) {
    this.logger.debug(
      `On Handle Event - ${PerformanceEventListener.RESERVE_SEAT_EVENT}`,
    );
    await this.performanceFacade.reserveSeat(event.seatId);
  }

  /**
   * 좌석 예약확정
   * @param event
   */
  @OnCustomEvent(PerformanceEventListener.BOOKING_SEAT_EVENT, { async: true })
  async handleBookingSeat(event: BookingSeatEvent) {
    this.logger.debug(
      `On Handle Event - ${PerformanceEventListener.BOOKING_SEAT_EVENT}`,
    );
    await this.performanceFacade.bookingSeat(event.seatId);
  }

  @OnCustomEventErrorHandler(PerformanceEventListener.EVENT_GROUP)
  override errorHandler(err: Error): void {
    this.logger.error(err);
  }
}
