import {
  RestApiEnumProperty,
  RestApiInstanceProperty,
  RestApiIntProperty,
  WithTotolCountResponse,
} from 'src/common';
import { SeatStatus } from '../../../domain';

export class GetSeatsResponse {
  @RestApiIntProperty({
    description: '좌석 ID',
    min: 1,
    default: 1,
  })
  id: number;

  @RestApiIntProperty({
    description: '공연 ID',
    min: 1,
    default: 31,
  })
  performanceId: number;

  @RestApiIntProperty({
    description: '좌석 위치',
    default: 13,
  })
  position: number;

  @RestApiIntProperty({
    description: '가격',
    default: 50000,
  })
  amount: number;

  @RestApiEnumProperty(SeatStatus, {
    description: '좌석 상태',
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;
}

export class GetSeatsWithTotolCountResponse extends WithTotolCountResponse {
  @RestApiInstanceProperty(GetSeatsResponse, {
    description: '좌석 리스트',
    isArray: true,
    minItems: 0,
  })
  results: GetSeatsResponse[] | [];
}
