import { QueueDomain, QueueEntity, QueueStatus } from '../../model';

export class CreateQueueInfo implements Pick<QueueEntity, 'uid' | 'status'> {
  constructor(
    readonly uid: string,
    readonly status: QueueStatus,
    readonly dateTime: Date,
  ) {}

  static of(domain: QueueDomain[]): CreateQueueInfo[];
  static of(domain: QueueDomain): CreateQueueInfo;
  static of(
    domain: QueueDomain | QueueDomain[],
  ): CreateQueueInfo | CreateQueueInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));
    return new CreateQueueInfo(
      domain.uid,
      domain.status,
      new Date(domain.timestamp),
    );
  }
}
