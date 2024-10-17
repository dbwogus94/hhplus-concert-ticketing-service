import { PointEntity } from '../../model';

export class GetUserPointInfo implements Pick<PointEntity, 'id' | 'amount'> {
  constructor(
    readonly id: number,
    readonly amount: number,
  ) {}

  static of(domain: PointEntity[]): GetUserPointInfo[];
  static of(domain: PointEntity): GetUserPointInfo;
  static of(
    domain: PointEntity | PointEntity[],
  ): GetUserPointInfo | GetUserPointInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));
    return new GetUserPointInfo(domain.id, domain.amount);
  }
}
