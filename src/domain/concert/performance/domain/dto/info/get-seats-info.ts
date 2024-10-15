import { SeatEntity, SeatStatus } from '../../model';

export class GetSeatsInfo
  implements
    Pick<SeatEntity, 'id' | 'position' | 'amount' | 'status' | 'performanceId'>
{
  constructor(
    readonly id: number,
    readonly position: number,
    readonly amount: number,
    readonly status: SeatStatus,
    readonly performanceId: number,
  ) {}

  static of(domain: SeatEntity[]): GetSeatsInfo[];
  static of(domain: SeatEntity): GetSeatsInfo;
  static of(domain: SeatEntity | SeatEntity[]): GetSeatsInfo | GetSeatsInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));

    return new GetSeatsInfo(
      domain.id,
      domain.position,
      domain.amount,
      domain.status,
      domain.performanceId,
    );
  }
}
