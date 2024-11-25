import { PaymentOutboxEntity } from '../../model';

export class GetPaymentOutboxInfo
  implements Pick<PaymentOutboxEntity, 'id' | 'transactionId'>
{
  constructor(
    readonly id: number,
    readonly transactionId: number,
  ) {}

  static of(domain: PaymentOutboxEntity[]): GetPaymentOutboxInfo[];
  static of(domain: PaymentOutboxEntity): GetPaymentOutboxInfo;
  static of(
    domain: PaymentOutboxEntity | PaymentOutboxEntity[],
  ): GetPaymentOutboxInfo | GetPaymentOutboxInfo[] {
    if (Array.isArray(domain)) return domain.map((d) => this.of(d));

    return new GetPaymentOutboxInfo(domain.id, domain.transactionId);
  }
}
