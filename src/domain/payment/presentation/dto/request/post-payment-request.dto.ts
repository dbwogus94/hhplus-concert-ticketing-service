import { IsInt, Min } from 'class-validator';
import { RestApiIntProperty } from 'src/common';

export class PostPaymentRequest {
  @RestApiIntProperty({
    description: '예약 ID',
    min: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  reservationId: number;
}
