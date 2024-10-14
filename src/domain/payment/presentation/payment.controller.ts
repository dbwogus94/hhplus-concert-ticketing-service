import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GetUserInfoDecorator } from 'src/common';
import { PostPaymentRequest, PostPaymentResponse } from './dto';
import { DocumentHelper } from './document';

@ApiTags('결제 API')
@Controller({ path: '/payments' })
export class PaymentController {
  @DocumentHelper('postPayment')
  @Post()
  @HttpCode(201)
  async postPayment(
    @Body() body: PostPaymentRequest,
    @GetUserInfoDecorator('userId') userId: number,
  ): Promise<PostPaymentResponse> {
    return { paymentId: 10 };
  }
}
