import { plainToInstance } from 'class-transformer';
import { RestApiIntProperty } from 'src/common';
import { GetUserPointInfo } from 'src/domain/user/domain';

export class GetUserPointResponse {
  @RestApiIntProperty({
    description: '현재 포인트 금액',
    min: 1,
    default: 1,
  })
  amount: number;

  static of(info: GetUserPointInfo): GetUserPointResponse;
  static of(info: GetUserPointInfo[]): GetUserPointResponse[];
  static of(
    info: GetUserPointInfo | GetUserPointInfo[],
  ): GetUserPointResponse | GetUserPointResponse[] {
    if (Array.isArray(info)) return info.map((i) => this.of(i));
    return plainToInstance(GetUserPointResponse, { info });
  }
}
