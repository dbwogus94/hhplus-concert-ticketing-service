import { Controller } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiExcludeController } from '@nestjs/swagger';

import {
  BaseEventListener,
  CustomLoggerService,
  OnCustomEvent,
  OnCustomEventErrorHandler,
  OnSyncEvent,
} from 'src/global';
import { PaymentFacade } from '../../application';
import { WriteOutboxCommand } from '../../doamin';
import { PayPaymentSyncEvent } from './dto';

@ApiExcludeController()
@Controller()
export class PaymentEventListener extends BaseEventListener {
  static readonly EVENT_GROUP = 'payment';
  static readonly PAY_OUTBOX_EVENT = 'payment.request.outbox';
  static readonly PAY_TOPIC_EVENT = 'payment.request.topic';

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly paymentFacade: PaymentFacade,
    eventEmitter: EventEmitter2,
  ) {
    super(PaymentEventListener.EVENT_GROUP, eventEmitter);
    this.logger.setTarget(this.constructor.name);
  }

  @OnSyncEvent(PaymentEventListener.PAY_OUTBOX_EVENT)
  async handlePayPayment(event: PayPaymentSyncEvent) {
    this.logger.debug(
      `On Handle Event - ${PaymentEventListener.PAY_OUTBOX_EVENT}`,
    );
    await this.paymentFacade.createOutbox(
      WriteOutboxCommand.from({
        transactionId: event.paymentId,
        domainName: PaymentEventListener.PAY_OUTBOX_EVENT,
        topic: PaymentEventListener.PAY_TOPIC_EVENT,
        payload: event.payload,
      }),
    );

    this.eventEmitter.emit(
      PaymentEventListener.PAY_TOPIC_EVENT,
      event.paymentId,
    );
  }

  @OnCustomEvent(PaymentEventListener.PAY_TOPIC_EVENT, { async: true })
  async handleRequestReservationSend(transactionId: number) {
    this.logger.debug(
      `On Handle Event - ${PaymentEventListener.PAY_TOPIC_EVENT}`,
    );
    await this.paymentFacade.emitOutbox(transactionId);
  }

  @OnCustomEventErrorHandler(PaymentEventListener.EVENT_GROUP)
  override errorHandler(err: Error): void {
    this.logger.error(err);
  }
}
