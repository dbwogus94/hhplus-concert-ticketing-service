import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  BaseEventListener,
  CustomLoggerService,
  OnCustomEvent,
  OnErrorEvent,
} from 'src/global';
import { ReservationFacade } from '../application';
import { ConfirmReservationEvent } from './event';

@Injectable()
export class ReservationEventListener extends BaseEventListener {
  static readonly EVENT_GROUP = 'reservation';
  static readonly CONFIRM_EVENT = 'reservation.confirm';

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly reservationFacade: ReservationFacade,
    eventEmitter: EventEmitter2,
  ) {
    super(ReservationEventListener.EVENT_GROUP, eventEmitter);
    this.logger.setTarget(this.constructor.name);
  }

  @OnCustomEvent(ReservationEventListener.CONFIRM_EVENT, { async: true })
  async handleReserveSeat(event: ConfirmReservationEvent) {
    this.logger.debug(
      `On Handle Event - ${ReservationEventListener.CONFIRM_EVENT}`,
    );
    await this.reservationFacade.confirm(event.reservationId);
  }

  @OnErrorEvent(ReservationEventListener.EVENT_GROUP)
  override errorHandler(err: Error): void {
    this.logger.error(err);
  }
}
