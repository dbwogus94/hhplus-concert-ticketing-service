import { Controller, Post, Get, Body, Headers, HttpCode } from '@nestjs/common';

@Controller({ path: 'queue', version: 'v1' })
export class QueueController {
  @Post('/tokens')
  @HttpCode(201)
  createQueueToken(@Body() body: any) {
    return {
      stateCode: '201',
      message: '성공',
      data: {
        queueToken: 'mock-queue-token',
        dateTime: '2023-06-01T10:00:00Z',
      },
    };
  }

  @Get('/tokens')
  @HttpCode(200)
  getQueueTokenStatus(@Headers('Authorization') auth: string) {
    return {
      stateCode: '200',
      message: '성공',
      data: {
        waitingNumber: 12,
        state: 'WAIT',
      },
    };
  }
}
