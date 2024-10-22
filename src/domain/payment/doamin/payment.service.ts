import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../infra';
import { GetPaymentInfo, WritePaymentCommand } from './dto';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    @InjectEntityManager() private readonly manager: EntityManager,
  ) {}

  async payment(command: WritePaymentCommand): Promise<GetPaymentInfo> {
    const payment = await this.paymentRepo.savePayment(command);
    return GetPaymentInfo.of(payment);
  }
}
