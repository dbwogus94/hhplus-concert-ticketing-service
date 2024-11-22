import { ReservationOutboxEntity } from '../../model';

export class GetReservationOutboxInfo
  implements Pick<ReservationOutboxEntity, 'id' | 'transactionId'>
{
  constructor(
    readonly id: number,
    readonly transactionId: number,
  ) {}

  static of(domain: ReservationOutboxEntity[]): GetReservationOutboxInfo[];
  static of(domain: ReservationOutboxEntity): GetReservationOutboxInfo;
  static of(
    domain: ReservationOutboxEntity | ReservationOutboxEntity[],
  ): GetReservationOutboxInfo | GetReservationOutboxInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));

    return new GetReservationOutboxInfo(domain.id, domain.transactionId);
  }
}
