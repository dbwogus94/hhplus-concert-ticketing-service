import { PerformanceEntity } from '../../model';

export class GetPerformancesInfo
  implements
    Pick<PerformanceEntity, 'id' | 'openDate' | 'startAt' | 'concertId'>
{
  constructor(
    readonly id: number,
    readonly openDate: string,
    readonly startAt: Date,
    readonly concertId: number,
  ) {}

  static of(domain: PerformanceEntity[]): GetPerformancesInfo[];
  static of(domain: PerformanceEntity): GetPerformancesInfo;
  static of(
    domain: PerformanceEntity | PerformanceEntity[],
  ): GetPerformancesInfo | GetPerformancesInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));
    return new GetPerformancesInfo(
      domain.id,
      domain.openDate,
      domain.startAt,
      domain.concertId,
    );
  }
}
