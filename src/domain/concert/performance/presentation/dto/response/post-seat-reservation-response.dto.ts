import { RestApiIntProperty } from 'src/common';

export class PostSeatReservationResponse {
  @RestApiIntProperty({
    description: '생성된 예약 ID',
    default: 1,
  })
  reservationId: number;
}
