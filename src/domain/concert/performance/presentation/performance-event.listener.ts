import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  BaseEventListener,
  CustomLoggerService,
  OnCustomEvent,
  OnErrorEvent,
} from 'src/global';
import { ReserveSeatEvent } from './event';
import { PerformanceFacade } from '../application';

@Injectable()
export class PerformanceEventListener extends BaseEventListener {
  static readonly EVENT_GROUP = 'perfromance';
  static readonly RESERVE_SEAT_EVENT = 'perfromance.reserveSeat';

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly performanceFacade: PerformanceFacade,
    eventEmitter: EventEmitter2,
  ) {
    super(PerformanceEventListener.EVENT_GROUP, eventEmitter);
    this.logger.setTarget(this.constructor.name);
  }

  /**
   * 좌석 예약 상태 변경 이벤트
   * @param event
   */
  @OnCustomEvent(PerformanceEventListener.RESERVE_SEAT_EVENT, { async: true })
  async handleReserveSeat(event: ReserveSeatEvent) {
    this.logger.debug(
      `On Handle Event - ${PerformanceEventListener.RESERVE_SEAT_EVENT}`,
    );
    await this.performanceFacade.reserveSeat(event.seatId);
  }

  @OnErrorEvent(PerformanceEventListener.EVENT_GROUP)
  override errorHandler(err: Error): void {
    this.logger.error(err);
  }
}
