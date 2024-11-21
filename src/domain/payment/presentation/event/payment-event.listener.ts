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
    // 아웃 박스 구현 예정
  }

  @OnCustomEventErrorHandler(PaymentEventListener.EVENT_GROUP)
  override errorHandler(err: Error): void {
    this.logger.error(err);
  }
}
