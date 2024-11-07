import { SeatEntity, SeatStatus } from 'src/domain/concert/performance';
import { BaseEntityFactory } from './base-entity-factory';
import { generateRandomInt } from './utils';

type SeatProperty = Pick<
  SeatEntity,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'performanceId'
  | 'status'
  | 'amount'
  | 'position'
>;

export class SeatFactory {
  static create(override: Partial<SeatProperty> = {}): SeatEntity {
    const entity = new SeatEntity();
    const properies: SeatProperty = {
      ...BaseEntityFactory.create(),
      performanceId: generateRandomInt(),
      status: SeatStatus.AVAILABLE,
      amount: 50_000,
      position: generateRandomInt({ min: 1, max: 50 }),
    };

    return Object.assign(entity, {
      ...properies,
      ...override,
    });
  }

  static createReserved(override: Partial<SeatProperty> = {}): SeatEntity {
    return SeatFactory.create(override).reserve();
  }

  static createBooked(override: Partial<SeatProperty> = {}): SeatEntity {
    return SeatFactory.create(override).reserve().booking();
  }
}
