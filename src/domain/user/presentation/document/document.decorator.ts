import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';

import { GetUserPointResponse } from '../dto';
import { UserController } from '../user.controller';

type API_DOC_TYPE = keyof UserController;

// eslint-disable-next-line @typescript-eslint/ban-types
const decorators: Record<API_DOC_TYPE, Function> = {
  patchUserPoint: () =>
    applyDecorators(
      ApiOperation({ summary: '포인트 충전요청' }),
      ApiCreatedResponse({
        description: '성공',
        type: GetUserPointResponse,
      }),
    ),
  getUserPoint: () =>
    applyDecorators(
      ApiOperation({ summary: '현재 포인트 잔액 요청' }),
      ApiCreatedResponse({
        description: '성공',
        type: GetUserPointResponse,
      }),
    ),
};

export const DocumentHelper = (docType: API_DOC_TYPE) => {
  return decorators[docType]();
};
