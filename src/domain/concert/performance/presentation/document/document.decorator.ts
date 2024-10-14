import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { PerformanceController } from '../performance.controller';
import {
  GetPerformancesWithTotolCountResponse,
  GetSeatsWithTotolCountResponse,
  PostSeatReservationResponse,
} from '../dto';

type API_DOC_TYPE = keyof PerformanceController;

// eslint-disable-next-line @typescript-eslint/ban-types
const decorators: Record<API_DOC_TYPE, Function> = {
  getPerformances: () =>
    applyDecorators(
      ApiOperation({ summary: '콘서트의 공연 리스트' }),
      ApiOkResponse({
        description: '콘서트의 공연 리스트 조회',
        type: GetPerformancesWithTotolCountResponse,
      }),
    ),

  getSeats: () =>
    applyDecorators(
      ApiOperation({ summary: '공연 좌석 리스트' }),
      ApiOkResponse({
        description: '공연 좌석 리스트 조회',
        type: GetSeatsWithTotolCountResponse,
      }),
    ),

  postSeatReservation: () =>
    applyDecorators(
      ApiOperation({ summary: '좌석 예약 신청' }),
      ApiCreatedResponse({
        description: '좌석 예약 신청',
        type: PostSeatReservationResponse,
      }),
    ),
};

export const DocumentHelper = (docType: API_DOC_TYPE) => {
  return decorators[docType]();
};
