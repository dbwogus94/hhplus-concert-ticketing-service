import { QueueStatus, WaitQueueDomain } from '../../model';

export class GetWaitQueueInfo implements Pick<WaitQueueDomain, 'status'> {
  constructor(
    readonly uid: string,
    readonly userId: number,
    readonly concertId: number,
    readonly status: QueueStatus,
    readonly waitingNumber: number,
  ) {}

  static of(param: WaitQueueDomain[]): GetWaitQueueInfo[];
  static of(param: WaitQueueDomain): GetWaitQueueInfo;
  static of(
    param: WaitQueueDomain | WaitQueueDomain[],
  ): GetWaitQueueInfo | GetWaitQueueInfo[] {
    if (Array.isArray(param)) return param.map((d) => this.of(d));
    return new GetWaitQueueInfo(
      param.uid,
      param.userId,
      param.concertId,
      param.status,
      param.waitingNumber,
    );
  }

  get isActive() {
    return this.status === QueueStatus.ACTIVE;
  }
}
