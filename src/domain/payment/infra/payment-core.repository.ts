import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { PaymentEntity, PaymentOutboxEntity } from '../doamin/model';
import {
  PaymentRepository,
  SaveOutboxParam,
  SavePaymentParam,
} from '../doamin';

export class PaymentCoreRepository extends PaymentRepository {
  readonly outboxRepo: Repository<PaymentOutboxEntity>;

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

  override async saveOutbox(param: SaveOutboxParam): Promise<void> {
    const outbox = this.outboxRepo.create({
      ...param,
      domainName: 'Payment',
    });
    await this.outboxRepo.save(outbox);
  }
}
