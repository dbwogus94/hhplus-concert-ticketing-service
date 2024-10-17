import { QueueEntity, QueueStatus } from '../../model';

type GetQueueInfoParam = Pick<
  QueueEntity,
  'uid' | 'userId' | 'concertId' | 'status'
> & {
  waitingNumber: number;
};

export class GetQueueInfo implements Pick<QueueEntity, 'status'> {
  constructor(
    readonly uid: string,
    readonly userId: number,
    readonly concertId: number,
    readonly status: QueueStatus,
    readonly waitingNumber: number,
  ) {}

  static of(param: GetQueueInfoParam[]): GetQueueInfo[];
  static of(param: GetQueueInfoParam): GetQueueInfo;
  static of(
    param: GetQueueInfoParam | GetQueueInfoParam[],
  ): GetQueueInfo | GetQueueInfo[] {
    if (Array.isArray(param)) return param.map((d) => this.of(d));
    return new GetQueueInfo(
      param.uid,
      param.userId,
      param.concertId,
      param.status,
      param.waitingNumber,
    );
  }
}
