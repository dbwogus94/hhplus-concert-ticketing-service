import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  BaseEventListener,
  CustomLoggerService,
  OnCustomEventErrorHandler,
  OnSyncEvent,
} from 'src/global';
import { PaymentFacade } from '../../application';
import { PayPaymentSyncEvent } from './dto';
import { WriteOutboxCommand } from '../../doamin';

@Injectable()
export class PaymentEventListener extends BaseEventListener {
  static readonly EVENT_GROUP = 'payment';
  static readonly PAY_EVENT = 'payment.pay';

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly paymentFacade: PaymentFacade,
    eventEmitter: EventEmitter2,
  ) {
    super(PaymentEventListener.EVENT_GROUP, eventEmitter);
    this.logger.setTarget(this.constructor.name);
  }

  @OnSyncEvent(PaymentEventListener.PAY_EVENT)
  async handlePayPayment(event: PayPaymentSyncEvent) {
    this.logger.debug(`On Handle Event - ${PaymentEventListener.PAY_EVENT}`);
    this.paymentFacade.createOutbox(
      WriteOutboxCommand.from({
        transactionId: event.paymentId,
        payload: event.payload,
        topic: PaymentEventListener.PAY_EVENT,
      }),
    );
  }

  @OnCustomEventErrorHandler(PaymentEventListener.EVENT_GROUP)
  override errorHandler(err: Error): void {
    this.logger.error(err);
  }
}
