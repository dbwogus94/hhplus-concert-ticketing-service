import { plainToInstance } from 'class-transformer';
import { RestApiIntProperty } from 'src/common';
import { GetPaymentInfo } from 'src/domain/payment/doamin';

export class PostPaymentResponse {
  @RestApiIntProperty({
    description: '생성된 결제 ID',
    min: 1,
    default: 1,
  })
  paymentId: number;

  static of(info: GetPaymentInfo): PostPaymentResponse;
  static of(info: GetPaymentInfo[]): PostPaymentResponse[];
  static of(
    info: GetPaymentInfo | GetPaymentInfo[],
  ): PostPaymentResponse | PostPaymentResponse[] {
    if (Array.isArray(info)) return info.map((i) => this.of(i));
    return plainToInstance(PostPaymentResponse, { info });
  }
}
