import { PaymentEntity } from '../../model';

export class GetPaymentInfo
  implements
    Pick<PaymentEntity, 'id' | 'userId' | 'reservationId' | 'payPrice'>
{
  constructor(
    readonly id: number,
    readonly userId: number,
    readonly reservationId: number,
    readonly payPrice: number,
  ) {}

  static of(domain: PaymentEntity[]): GetPaymentInfo[];
  static of(domain: PaymentEntity): GetPaymentInfo;
  static of(
    domain: PaymentEntity | PaymentEntity[],
  ): GetPaymentInfo | GetPaymentInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));
    return new GetPaymentInfo(
      domain.id,
      domain.userId,
      domain.reservationId,
      domain.payPrice,
    );
  }
}
