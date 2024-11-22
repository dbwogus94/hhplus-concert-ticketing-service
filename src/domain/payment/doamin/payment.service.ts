import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { GetPaymentInfo, WriteOutboxCommand, WritePaymentCommand } from './dto';
import { PaymentProducer, PaymentRepository } from './interface';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly paymentProducer: PaymentProducer,
  ) {}

  payment(
    command: WritePaymentCommand,
  ): (manager?: EntityManager) => Promise<GetPaymentInfo> {
    return async (manager: EntityManager = null) => {
      const txPaymentRepo = manager
        ? this.paymentRepo.createTransactionRepo(manager)
        : this.paymentRepo;

      const payment = await txPaymentRepo.savePayment(command);
      return GetPaymentInfo.of(payment);
    };
  }

  async createOutbox(command: WriteOutboxCommand): Promise<void> {
    return this.paymentRepo.saveOutbox({
      transactionId: command.transactionId,
      domainName: command.domainName,
      topic: command.topic,
      payload: command.payload,
      isSent: false,
    });
  }

  async emitOutbox(transactionId: number): Promise<void> {
    const outbox = await this.paymentRepo.getOutboxBy({
      transactionId: transactionId,
      isSent: false,
    });

    this.paymentProducer.emitPayPayment({
      ...outbox,
    });
  }
}
