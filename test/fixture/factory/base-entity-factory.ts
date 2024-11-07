import { BaseEntity } from 'src/common';
import { generateRandomInt } from './utils';

export class BaseEntityFactory {
  static create(): BaseEntity {
    return {
      id: generateRandomInt(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
