import { IsInt, Min } from 'class-validator';
import { RestApiIntProperty } from 'src/common';

export class PostQueueTokenRequest {
  @RestApiIntProperty({
    description: '대기열을 등록할 콘서트 ID',
    min: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  concertId: number;

  @RestApiIntProperty({
    description: 'userId',
    min: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  userId: number;
}
