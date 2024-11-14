import { QueueStatus, WaitQueueDomain } from '../../model';

export class CreateWaitQueueInfo
  implements Pick<WaitQueueDomain, 'uid' | 'status'>
{
  constructor(
    readonly uid: string,
    readonly status: QueueStatus,
    readonly dateTime: Date,
  ) {}

  static of(domain: WaitQueueDomain[]): CreateWaitQueueInfo[];
  static of(domain: WaitQueueDomain): CreateWaitQueueInfo;
  static of(
    domain: WaitQueueDomain | WaitQueueDomain[],
  ): CreateWaitQueueInfo | CreateWaitQueueInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));
    return new CreateWaitQueueInfo(
      domain.uid,
      domain.status,
      new Date(domain.timestamp),
    );
  }
}
