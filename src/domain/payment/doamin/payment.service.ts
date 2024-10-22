import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../infra';
import { GetPaymentInfo, WritePaymentCommand } from './dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly paymentRepo: PaymentRepository,
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
}
