import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { PostQueueStateResponse, PostQueueTokenResponse } from '../dto';
import { QueueController } from '../queue.controller';

type API_DOC_TYPE = keyof QueueController;

// eslint-disable-next-line @typescript-eslint/ban-types
const decorators: Record<API_DOC_TYPE, Function> = {
  postQueueToken: () =>
    applyDecorators(
      ApiOperation({ summary: '큐 대기토큰 발급' }),
      ApiCreatedResponse({
        description: '성공',
        type: PostQueueTokenResponse,
      }),
    ),

  getQueueTokenStatus: () =>
    applyDecorators(
      ApiOperation({ summary: '큐 대기토큰 상태 조회' }),
      ApiOkResponse({
        description: '성공',
        type: PostQueueStateResponse,
      }),
    ),
};

export const DocumentHelper = (docType: API_DOC_TYPE) => {
  return decorators[docType]();
};
