import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  BaseEventListener,
  CustomLoggerService,
  OnCustomEvent,
  OnCustomEventErrorHandler,
  OnSyncEvent,
} from 'src/global';
import { ReservationFacade } from '../../application';
import { WriteOutboxCommand } from '../../doamin';
import { RequestReservationSyncEvent } from './dto';

@Injectable()
export class ReservationEventListener extends BaseEventListener {
  static readonly EVENT_GROUP = 'reservation';
  static readonly REQUEST_OUTBOX_EVENT = 'reservation.request.outbox';
  static readonly REQUEST_TOPIC_EVENT = 'reservation.request.topic';

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly reservationFacade: ReservationFacade,
    eventEmitter: EventEmitter2,
  ) {
    super(ReservationEventListener.EVENT_GROUP, eventEmitter);
    this.logger.setTarget(this.constructor.name);
  }

  @OnSyncEvent(ReservationEventListener.REQUEST_OUTBOX_EVENT)
  async handleRequestReservationOutBox(event: RequestReservationSyncEvent) {
    this.logger.debug(
      `On Handle Event - ${ReservationEventListener.REQUEST_OUTBOX_EVENT}`,
    );
    await this.reservationFacade.createOutbox(
      WriteOutboxCommand.from({
        transactionId: event.reservationId,
        domainName: ReservationEventListener.REQUEST_OUTBOX_EVENT,
        topic: ReservationEventListener.REQUEST_TOPIC_EVENT,
        payload: event.payload,
      }),
    );

    this.eventEmitter.emit(
      ReservationEventListener.REQUEST_TOPIC_EVENT,
      event.reservationId,
    );
  }

  @OnCustomEvent(ReservationEventListener.REQUEST_TOPIC_EVENT, { async: true })
  async handleRequestReservationSend(transactionId: number) {
    this.logger.debug(
      `On Handle Event - ${ReservationEventListener.REQUEST_TOPIC_EVENT}`,
    );
    await this.reservationFacade.emitOutbox(transactionId);
  }

  @OnCustomEventErrorHandler(ReservationEventListener.EVENT_GROUP)
  override errorHandler(err: Error): void {
    this.logger.error(err);
    throw err;
  }
}
