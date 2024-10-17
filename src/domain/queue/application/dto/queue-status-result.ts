import { GetQueueInfo, QueueStatus } from '../../domain';

type QueueStatusResultParam = GetQueueInfo & {
  jwt?: string;
};

export class QueueStatusResult {
  constructor(
    private readonly status: QueueStatus,
    private readonly waitingNumber: number,
    private readonly jwt?: string,
  ) {}

  static of(param: QueueStatusResultParam): QueueStatusResult;
  static of(param: QueueStatusResultParam[]): QueueStatusResult[];
  static of(
    param: QueueStatusResultParam | QueueStatusResultParam[],
  ): QueueStatusResult | QueueStatusResult[] {
    if (Array.isArray(param)) return param.map((i) => this.of(i));

    return new QueueStatusResult(param.status, param.waitingNumber, param.jwt);
  }
}
