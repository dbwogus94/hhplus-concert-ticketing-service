import { ReservationEntity, ReservationStatus } from 'src/domain/reservation';
import { BaseEntityFactory } from './base-entity-factory';
import { generateRandomInt } from './utils';

type ReservationProperty = Pick<
  ReservationEntity,
  'id' | 'createdAt' | 'updatedAt' | 'userId' | 'seatId' | 'price' | 'status'
>;

export class ReservationFactory {
  static create(
    override: Partial<ReservationProperty> = {},
  ): ReservationEntity {
    const entity = new ReservationEntity();
    const properies: ReservationProperty = {
      ...BaseEntityFactory.create(),
      userId: generateRandomInt(),
      seatId: generateRandomInt(),
      price: 50_000,
      status: ReservationStatus.REQUEST,
    };

    return Object.assign(entity, {
      ...properies,
      ...override,
    });
  }

  static createConfirm(override: Partial<ReservationProperty> = {}) {
    return ReservationFactory.create(override).confirm();
  }
}
