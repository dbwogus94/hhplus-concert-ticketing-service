import { IsEnum } from 'class-validator';
import { RestApiEnumPropertyOptional } from 'src/common';
import { SeatStatus } from '../../../domain';

export class GetSeatsQuery {
  @RestApiEnumPropertyOptional(SeatStatus, {
    description: '콘서트 ID',
  })
  @IsEnum(SeatStatus)
  status?: SeatStatus | null;
}
