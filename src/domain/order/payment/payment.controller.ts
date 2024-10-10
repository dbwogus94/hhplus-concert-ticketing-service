import { Controller, Post, Body, Headers } from '@nestjs/common';

@Controller({ path: 'payments', version: 'v1' })
export class PaymentController {
  @Post()
  createPayment(@Body() body: any, @Headers('Authorization') auth: string) {
    return {
      stateCode: '201',
      message: '성공',
      data: {
        paymentId: 10,
      },
    };
  }
}
