import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PerformanceController } from '../performance.controller';
import {
  GetPerformancesWithTotolCountResponse,
  GetSeatsWithTotolCountResponse,
} from '../dto';
import { SERVICE_ACCESS_TOKEN } from 'src/common';

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
      ApiUnauthorizedResponse({
        description: '인증 에러',
      }),
    ),

  getSeats: () =>
    applyDecorators(
      ApiSecurity(SERVICE_ACCESS_TOKEN),
      ApiOperation({ summary: '공연 좌석 리스트' }),
      ApiOkResponse({
        description: '공연 좌석 리스트 조회',
        type: GetSeatsWithTotolCountResponse,
      }),
      ApiUnauthorizedResponse({
        description: '인증 에러',
      }),
    ),
};

export const DocumentHelper = (docType: API_DOC_TYPE) => {
  return decorators[docType]();
};
