import { QueueEntity, QueueStatus } from 'src/domain/queue';
import { BaseEntityFactory } from './base-entity-factory';
import { generateRandomInt } from './utils';

type QueueProperty = Pick<
  QueueEntity,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'uid'
  | 'userId'
  | 'concertId'
  | 'status'
  | 'activeExpireAt'
  | 'activedAt'
  | 'activeFirstAccessAt'
>;

export class QueueFactory {
  static create(override: Partial<QueueProperty>): QueueEntity {
    const entity = new QueueEntity();
    const property: QueueProperty = {
      ...BaseEntityFactory.create(),
      uid: QueueEntity.generateUUIDv4(),
      concertId: generateRandomInt(),
      userId: generateRandomInt(),
      status: QueueStatus.WAIT,
      activeExpireAt: null,
      activedAt: null,
      activeFirstAccessAt: null,
    };

    return Object.assign(entity, {
      ...property,
      ...override,
    });
  }

  static createActiveByNoAccess(override: Partial<QueueProperty> = {}) {
    return QueueFactory.create(override).active();
  }

  static createActiveByAccess(override: Partial<QueueProperty> = {}) {
    return QueueFactory.create(override).active().calculateActiveExpire();
  }

  static createExpire(override: Partial<QueueProperty> = {}) {
    return QueueFactory.create(override)
      .active()
      .calculateActiveExpire()
      .expire();
  }
}
