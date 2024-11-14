import { ActiveQueueDomain, QueueStatus } from '../../model';

export class FindActiveQueueInfo
  implements
    Pick<
      ActiveQueueDomain['prop'],
      'uid' | 'userId' | 'concertId' | 'status' | 'activeFirstAccessAt'
    >
{
  constructor(
    readonly uid: string,
    readonly userId: number,
    readonly concertId: number,
    readonly status: QueueStatus,
    readonly activeExpireAt?: Date,
    readonly activeFirstAccessAt?: Date,
  ) {}

  static of(domain: ActiveQueueDomain[]): FindActiveQueueInfo[];
  static of(domain: ActiveQueueDomain): FindActiveQueueInfo;
  static of(
    domain: ActiveQueueDomain | ActiveQueueDomain[],
  ): FindActiveQueueInfo | FindActiveQueueInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));
    return new FindActiveQueueInfo(
      domain.uid,
      domain.userId,
      domain.concertId,
      domain.status,
      domain.activeFirstAccessAt,
    );
  }
}
