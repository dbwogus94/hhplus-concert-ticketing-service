import { IsInt, Min } from 'class-validator';
import { RestApiIntProperty } from 'src/common';

export class PatchUserPointRequest {
  @RestApiIntProperty({
    description: '충전금액',
    min: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  amount: number;
}
