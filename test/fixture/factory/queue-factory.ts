import { ActiveQueueDomain, QueueStatus } from 'src/domain/queue';
import { generateRandomInt } from './utils';

type QueueProperty = Pick<
  ActiveQueueDomain['prop'],
  | 'uid'
  | 'userId'
  | 'concertId'
  | 'status'
  | 'timestamp'
  | 'activedAt'
  | 'activeFirstAccessAt'
>;

export class QueueFactory {
  static create(override: Partial<QueueProperty>): ActiveQueueDomain {
    const property: QueueProperty = {
      uid: ActiveQueueDomain.generateUUIDv4(),
      concertId: generateRandomInt(),
      userId: generateRandomInt(),
      status: QueueStatus.WAIT,
      timestamp: Date.now(),
      activedAt: null,
      activeFirstAccessAt: null,
    };

    return new ActiveQueueDomain({
      ...property,
      ...override,
    });
  }

  static createActiveByNoAccess(override: Partial<QueueProperty> = {}) {
    return QueueFactory.create(override).active();
  }

  static createActiveByAccess(override: Partial<QueueProperty> = {}) {
    return QueueFactory.create(override).active();
  }

  static createExpire(override: Partial<QueueProperty> = {}) {
    return QueueFactory.create(override).active().expire();
  }
}
