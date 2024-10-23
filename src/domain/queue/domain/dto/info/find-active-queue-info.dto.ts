import { QueueEntity, QueueStatus } from '../../model';

export class FindActiveQueueInfo
  implements
    Pick<
      QueueEntity,
      | 'uid'
      | 'userId'
      | 'concertId'
      | 'status'
      | 'activeExpireAt'
      | 'activeFirstAccessAt'
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

  static of(domain: QueueEntity[]): FindActiveQueueInfo[];
  static of(domain: QueueEntity): FindActiveQueueInfo;
  static of(
    domain: QueueEntity | QueueEntity[],
  ): FindActiveQueueInfo | FindActiveQueueInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));
    return new FindActiveQueueInfo(
      domain.uid,
      domain.userId,
      domain.concertId,
      domain.status,
      domain.activeExpireAt,
      domain.activeFirstAccessAt,
    );
  }
}
