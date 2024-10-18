import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetUserInfoDecorator } from 'src/common';
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
    @GetUserInfoDecorator('userId') userId: number,
  ): Promise<PostPaymentResponse> {
    const result = await this.paymentFacade.payment(
      WritePaymentCriteria.from({
        reservationId: body.reservationId,
        userId,
      }),
    );
    return PostPaymentResponse.of(result);
  }
}
