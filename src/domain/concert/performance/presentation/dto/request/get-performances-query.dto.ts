import { IsInt, Min } from 'class-validator';
import { RestApiIntProperty } from 'src/common';

export class GetPerformancesQuery {
  @RestApiIntProperty({
    description: '콘서트 ID',
    min: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  concertId: number;
}
