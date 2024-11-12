import { QueueStatus, WaitQueueDomain } from '../../model';

type GetWaitQueueInfoParam = {
  queue: Pick<WaitQueueDomain, 'uid' | 'userId' | 'concertId' | 'status'>;
  waitingNumber: number;
};

export class GetWaitQueueInfo implements Pick<WaitQueueDomain, 'status'> {
  constructor(
    readonly uid: string,
    readonly userId: number,
    readonly concertId: number,
    readonly status: QueueStatus,
    readonly waitingNumber: number,
  ) {}

  static of(param: GetWaitQueueInfoParam[]): GetWaitQueueInfo[];
  static of(param: GetWaitQueueInfoParam): GetWaitQueueInfo;
  static of(
    param: GetWaitQueueInfoParam | GetWaitQueueInfoParam[],
  ): GetWaitQueueInfo | GetWaitQueueInfo[] {
    if (Array.isArray(param)) return param.map((d) => this.of(d));
    return new GetWaitQueueInfo(
      param.queue.uid,
      param.queue.userId,
      param.queue.concertId,
      param.queue.status,
      param.waitingNumber,
    );
  }
}
