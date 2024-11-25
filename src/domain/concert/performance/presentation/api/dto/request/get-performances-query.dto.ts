import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { RestApiIntProperty } from 'src/common';

export class GetPerformancesQuery {
  @RestApiIntProperty({
    description: '콘서트 ID',
    min: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  concertId: number;
}
