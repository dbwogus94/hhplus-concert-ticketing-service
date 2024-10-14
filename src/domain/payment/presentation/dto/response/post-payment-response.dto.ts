import { RestApiIntProperty } from 'src/common';

export class PostPaymentResponse {
  @RestApiIntProperty({
    description: '생성된 결제 ID',
    min: 1,
    default: 1,
  })
  paymentId: number;
}
