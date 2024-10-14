import { RestApiIntProperty } from '../decorator';

class TotalCountResponse {
  @RestApiIntProperty({
    description: '조회된 총개수',
    min: 0,
  })
  totalCount: number;
}

export abstract class WithTotolCountResponse extends TotalCountResponse {
  abstract results: unknown[];
}
