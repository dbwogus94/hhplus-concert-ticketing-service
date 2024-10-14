import { Controller, Post, Get, Body, Headers, HttpCode } from '@nestjs/common';
import {
  PostQueueTokenResponse,
  PostQueueTokenRequest,
  GetQueueTokenResponse,
} from './dto';
import { QueueStatus } from './domain/model';
import { DocumentHelper } from './document';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('대기큐 API')
@Controller({ path: 'queue' })
export class QueueController {
  @DocumentHelper('postQueueToken')
  @Post('/tokens')
  @HttpCode(201)
  async postQueueToken(
    @Body() body: PostQueueTokenRequest,
  ): Promise<PostQueueTokenResponse> {
    return {
      queueToken: 'mock-queue-token',
      issuedAt: new Date('2023-06-01T10:00:00Z'),
    };
  }

  @DocumentHelper('getQueueTokenStatus')
  @Get('/tokens')
  @HttpCode(200)
  async getQueueTokenStatus(
    @Headers('Waiting-Token') uuid: string,
  ): Promise<GetQueueTokenResponse> {
    return {
      waitingNumber: 12,
      state: QueueStatus.WAIT,
      // accessToken: '
    };
  }
}
