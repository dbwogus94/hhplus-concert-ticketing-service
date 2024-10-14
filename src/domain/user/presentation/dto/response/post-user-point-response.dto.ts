import { RestApiIntProperty } from 'src/common';

export class GetUserPointResponse {
  @RestApiIntProperty({
    description: '현재 포인트 금액',
    min: 1,
    default: 1,
  })
  amount: number;
}
