import { plainToInstance } from 'class-transformer';
import { RestApiIntProperty } from 'src/common';

export class PostReservationResponse {
  @RestApiIntProperty({
    description: '생성된 예약 ID',
    default: 1,
  })
  reservationId: number;

  static of(info: { reservationId: number }): PostReservationResponse {
    return plainToInstance(PostReservationResponse, { info });
  }
}
