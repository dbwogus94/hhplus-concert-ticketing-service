import { BaseRepository } from 'src/common';

import { PaymentEntity } from '../doamin/model';

export type SavePaymentParam = Pick<
  PaymentEntity,
  'userId' | 'reservationId' | 'payPrice'
>;

export abstract class PaymentRepository extends BaseRepository<PaymentEntity> {
  abstract savePayment(param: SavePaymentParam): Promise<PaymentEntity>;
}
