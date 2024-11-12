import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { QueueFacade } from '../application';
import { WriteWaitQueueCommand } from '../domain';
import { DocumentHelper } from './document';
import {
  PostQueueStateRequest,
  PostQueueStateResponse,
  PostQueueTokenRequest,
  PostQueueTokenResponse,
} from './dto';

@ApiTags('대기큐 API')
@Controller({ path: 'queue' })
export class QueueController {
  constructor(private readonly queueFacade: QueueFacade) {}

  @DocumentHelper('postQueueToken')
  @Post('/tokens')
  @HttpCode(201)
  async postQueueToken(
    @Body() body: PostQueueTokenRequest,
  ): Promise<PostQueueTokenResponse> {
    const info = await this.queueFacade.createQueue(
      WriteWaitQueueCommand.from({ ...body }),
    );
    return PostQueueTokenResponse.of({ ...info });
  }

  @DocumentHelper('getQueueTokenStatus')
  @Post('/status')
  @HttpCode(200)
  async getQueueTokenStatus(
    @Body() body: PostQueueStateRequest,
  ): Promise<PostQueueStateResponse> {
    const result = await this.queueFacade.getQueueStatus(body.waitToken);
    return PostQueueStateResponse.of(result);
  }
}
