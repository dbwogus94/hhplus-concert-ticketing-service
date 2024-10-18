import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { PaymentEntity } from '../doamin/model';
import { PaymentRepository, SavePaymentParam } from './payment.repository';

export class PaymentCoreRepository extends PaymentRepository {
  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(PaymentEntity, manager);
  }

  override async savePayment(param: SavePaymentParam): Promise<PaymentEntity> {
    const payment = this.create(param);
    await this.save(payment);
    return payment;
  }
}
