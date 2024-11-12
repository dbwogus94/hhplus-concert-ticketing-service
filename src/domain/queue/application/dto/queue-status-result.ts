import { GetWaitQueueInfo, QueueStatus } from '../../domain';

type QueueStatusResultParam = GetWaitQueueInfo & {
  accessToken?: string;
};

export class QueueStatusResult {
  constructor(
    private readonly status: QueueStatus,
    private readonly waitingNumber: number,
    private readonly accessToken?: string,
  ) {}

  static of(param: QueueStatusResultParam): QueueStatusResult;
  static of(param: QueueStatusResultParam[]): QueueStatusResult[];
  static of(
    param: QueueStatusResultParam | QueueStatusResultParam[],
  ): QueueStatusResult | QueueStatusResult[] {
    if (Array.isArray(param)) return param.map((i) => this.of(i));

    return new QueueStatusResult(
      param.status,
      param.waitingNumber,
      param.accessToken,
    );
  }
}
