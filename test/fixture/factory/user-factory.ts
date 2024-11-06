import { faker } from '@faker-js/faker';
import { UserEntity } from 'src/domain/user';
import { BaseEntityFactory } from './base-entity-factory';
import { generateRandomInt } from './utils';

export class UserFactory {
  static create(override: Partial<UserEntity> = {}): UserEntity {
    const entity = new UserEntity();
    const name = faker.person.firstName();
    const properies: UserEntity = {
      ...BaseEntityFactory.create(),
      pointId: generateRandomInt(),
      name,
      email: faker.internet.email({ firstName: name }),
    };

    return Object.assign(entity, {
      ...properies,
      ...override,
    });
  }
}
