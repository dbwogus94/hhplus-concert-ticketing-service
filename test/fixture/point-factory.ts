import { PointEntity } from 'src/domain/user';
import { BaseEntityFactory } from './base-entity-factory';

type PointProperty = Pick<
  PointEntity,
  'id' | 'createdAt' | 'updatedAt' | 'amount'
>;

export class PointFactory {
  static create(override: Partial<PointProperty> = {}): PointEntity {
    const entity = new PointEntity();
    const properies: PointProperty = {
      ...BaseEntityFactory.create(),
      amount: 0,
    };

    return Object.assign(entity, {
      ...properies,
      ...override,
    });
  }
}
