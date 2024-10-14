import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';

import { PaymentController } from '../payment.controller';
import { PostPaymentResponse } from '../dto';

type API_DOC_TYPE = keyof PaymentController;

// eslint-disable-next-line @typescript-eslint/ban-types
const decorators: Record<API_DOC_TYPE, Function> = {
  postPayment: () =>
    applyDecorators(
      ApiOperation({ summary: '결제 요청' }),
      ApiCreatedResponse({
        description: '결제 성공했습니다.',
        type: PostPaymentResponse,
      }),
    ),
};

export const DocumentHelper = (docType: API_DOC_TYPE) => {
  return decorators[docType]();
};
