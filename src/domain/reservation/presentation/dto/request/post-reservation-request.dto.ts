import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { RestApiIntProperty } from 'src/common';

export class PostReservationRequest {
  @RestApiIntProperty({
    description: '공연 ID',
    min: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  performanceId: number;

  @RestApiIntProperty({
    description: '좌석 ID',
    min: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  seatId: number;
}
