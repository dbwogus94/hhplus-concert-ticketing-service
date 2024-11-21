import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import {
  BaseEventListener,
  CustomLoggerService,
  OnCustomEvent,
  OnCustomEventErrorHandler,
} from 'src/global';
import { ReservationFacade } from '../../application';
import { ConfirmReservationEvent, RequestReservationSyncEvent } from './dto';

// type Events = {
//   'reservation.confirm': ConfirmReservationEvent;
//   'reservation.request': RequestReservationSyncEvent;
// };

@Injectable()
export class ReservationEventListener extends BaseEventListener {
  static readonly EVENT_GROUP = 'reservation';
  static readonly CONFIRM_EVENT = 'reservation.confirm';
  static readonly REQUEST_EVENT = 'reservation.request';

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly reservationFacade: ReservationFacade,
    eventEmitter: EventEmitter2,
  ) {
    super(ReservationEventListener.EVENT_GROUP, eventEmitter);
    this.logger.setTarget(this.constructor.name);
  }

  /**
   * @param event
   * @deprecated
   */
  @OnCustomEvent(ReservationEventListener.CONFIRM_EVENT, { async: true })
  async handleReserveSeat(event: ConfirmReservationEvent) {
    this.logger.debug(
      `On Handle Event - ${ReservationEventListener.CONFIRM_EVENT}`,
    );
    await this.reservationFacade.confirm(event.reservationId);
  }

  @OnEvent(ReservationEventListener.REQUEST_EVENT, {
    async: false,
    suppressErrors: false, // 에러 전파 허용
  })
  handleRequestReservation(event: RequestReservationSyncEvent) {
    this.logger.debug(
      `On Handle Event - ${ReservationEventListener.REQUEST_EVENT}`,
    );
    console.log('헨들러 에러 발행');

    // throw new Error('Event Handler Error');
    // 아웃 박스 구현 예정
    // await this.reservationFacade.confirm(event.reservationId);
  }

  @OnCustomEventErrorHandler(ReservationEventListener.EVENT_GROUP)
  override errorHandler(err: Error): void {
    this.logger.error(err);
    throw err;
  }
}
