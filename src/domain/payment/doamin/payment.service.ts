import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../infra';
import { GetPaymentInfo, WritePaymentCommand } from './dto';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async payment(command: WritePaymentCommand): Promise<GetPaymentInfo> {
    const payment = await this.paymentRepo.savePayment(command);
    return GetPaymentInfo.of(payment);
  }
}
