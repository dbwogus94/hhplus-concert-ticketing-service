import { PerformanceEntity } from 'src/domain/concert/performance';
import { BaseEntityFactory } from './base-entity-factory';
import {
  generateFutureAt,
  generateFutureDate,
  generateRandomInt,
} from './utils';

export class PerformanceFactory {
  static create(override: Partial<PerformanceEntity> = {}): PerformanceEntity {
    const entity = new PerformanceEntity();
    const properies: PerformanceEntity = {
      ...BaseEntityFactory.create(),
      concertId: generateRandomInt(),
      openDate: generateFutureDate(),
      startAt: generateFutureAt(),
    };

    return Object.assign(entity, {
      ...properies,
      ...override,
    });
  }
}
