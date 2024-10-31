import { PaymentEntity } from 'src/domain/payment/doamin';
import { BaseEntityFactory } from './base-entity-factory';
import { generateRandomInt } from './utils';

export class PaymentFactory {
  static create(override: Partial<PaymentEntity> = {}) {
    const entity = new PaymentEntity();

    const property: PaymentEntity = {
      ...BaseEntityFactory.create(),
      reservationId: generateRandomInt(),
      userId: generateRandomInt(),
      payPrice: 50_000,
    };

    return Object.assign(entity, {
      ...property,
      ...override,
    });
  }
}
