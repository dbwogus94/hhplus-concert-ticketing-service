import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SERVICE_ACCESS_TOKEN } from 'src/common';
import { PostReservationResponse } from '../dto';
import { ReservationController } from '../reservation.controller';

type API_DOC_TYPE = keyof ReservationController;

// eslint-disable-next-line @typescript-eslint/ban-types
const decorators: Record<API_DOC_TYPE, Function> = {
  postReservation: () =>
    applyDecorators(
      ApiSecurity(SERVICE_ACCESS_TOKEN),
      ApiOperation({ summary: '좌석 예약 신청' }),
      ApiCreatedResponse({
        description: '좌석 예약 신청',
        type: PostReservationResponse,
      }),
      ApiUnauthorizedResponse({
        description: '인증 에러',
      }),
    ),
};

export const DocumentHelper = (docType: API_DOC_TYPE) => {
  return decorators[docType]();
};
