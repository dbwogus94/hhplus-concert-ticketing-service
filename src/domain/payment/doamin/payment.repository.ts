import { BaseRepository } from 'src/common';

import { PaymentEntity, PaymentOutboxEntity } from './model';

export type SavePaymentParam = Pick<
  PaymentEntity,
  'userId' | 'reservationId' | 'payPrice'
>;

export type SaveOutboxParam = Pick<
  PaymentOutboxEntity,
  'transactionId' | 'topic' | 'payload' | 'isSent'
>;

export abstract class PaymentRepository extends BaseRepository<PaymentEntity> {
  abstract savePayment(param: SavePaymentParam): Promise<PaymentEntity>;

  abstract saveOutbox(param: SaveOutboxParam): Promise<void>;
}
