import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaymentFacade, WritePaymentCriteria } from '../application';
import { DocumentHelper } from './document';
import { PostPaymentRequest, PostPaymentResponse } from './dto';

@ApiTags('결제 API')
@Controller({ path: '/payments' })
export class PaymentController {
  constructor(private readonly paymentFacade: PaymentFacade) {}

  @DocumentHelper('postPayment')
  @Post()
  @HttpCode(201)
  async postPayment(
    @Body() body: PostPaymentRequest,
  ): Promise<PostPaymentResponse> {
    const result = await this.paymentFacade.payment(
      WritePaymentCriteria.from({ ...body }),
    );
    return PostPaymentResponse.of(result);
  }
}
