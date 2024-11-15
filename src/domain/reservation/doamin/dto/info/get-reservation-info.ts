import { ReservationEntity, ReservationStatus } from '../../model';

export class GetReservationInfo
  implements
    Pick<ReservationEntity, 'id' | 'userId' | 'seatId' | 'price' | 'status'>
{
  constructor(
    readonly id: number,
    readonly userId: number,
    readonly seatId: number,
    readonly price: number,
    readonly status: ReservationStatus,
  ) {}

  static of(domain: ReservationEntity[]): GetReservationInfo[];
  static of(domain: ReservationEntity): GetReservationInfo;
  static of(
    domain: ReservationEntity | ReservationEntity[],
  ): GetReservationInfo | GetReservationInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));

    return new GetReservationInfo(
      domain.id,
      domain.userId,
      domain.seatId,
      domain.price,
      domain.status,
    );
  }
}
