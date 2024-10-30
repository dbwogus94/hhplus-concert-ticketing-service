import { faker } from '@faker-js/faker';

import { ConcertEntity } from 'src/domain/concert/performance';
import { BaseEntityFactory } from './base-entity-factory';
import { generateFutureDate } from './utils';

export class ConcertFactory {
  static create(override: Partial<ConcertEntity> = {}): ConcertEntity {
    const entity = new ConcertEntity();
    const properies: ConcertEntity = {
      ...BaseEntityFactory.create(),
      name: faker.lorem.words(2),
      description: faker.lorem.words(10),
      startDate: generateFutureDate(),
      endDate: generateFutureDate(),
    };

    return Object.assign(entity, {
      ...properies,
      ...override,
    });
  }
}
