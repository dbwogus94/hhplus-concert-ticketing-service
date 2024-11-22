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
    await this.paymentRepo.saveOutbox({
      transactionId: command.transactionId,
      domainName: command.domainName,
      topic: command.topic,
      payload: command.payload,
      isSent: false,
    });
  }

  async sendOutbox(transactionId: number): Promise<void> {
    const outbox = await this.paymentRepo.getOutboxBy({
      transactionId,
      isSent: false,
    });

    await this.paymentProducer.sendPayPayment({
      ...outbox,
    });

    await this.paymentRepo.saveOutbox({
      transactionId,
      isSent: true,
    });
  }
}
