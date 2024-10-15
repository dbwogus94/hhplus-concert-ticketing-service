import {
  RestApiDateProperty,
  RestApiInstanceProperty,
  RestApiIntProperty,
  RestApiStringProperty,
  WithTotolCountResponse,
} from 'src/common';

export class GetPerformancesResponse {
  @RestApiIntProperty({
    description: '공연 ID',
    min: 1,
    default: 1,
  })
  id: number;

  @RestApiIntProperty({
    description: '콘서트 ID',
    min: 1,
    default: 31,
  })
  concertId: number;

  @RestApiStringProperty({
    description: '공연 오픈일(YYYY-MM-DD)',
    default: '2024-01-01',
  })
  openDate: string;

  @RestApiDateProperty({
    description: '공연 시작 시간',
    default: new Date('2024-01-01 15:00:00'),
  })
  startAt: Date;
}

export class GetPerformancesWithTotolCountResponse extends WithTotolCountResponse {
  @RestApiInstanceProperty(GetPerformancesResponse, {
    description: '공연 리스트',
    isArray: true,
    minItems: 0,
  })
  results: GetPerformancesResponse[] | [];
}
