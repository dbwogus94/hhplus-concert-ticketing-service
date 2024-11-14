import { plainToInstance } from 'class-transformer';
import { RestApiDateProperty, RestApiStringProperty } from 'src/common';
import { CreateWaitQueueInfo } from 'src/domain/queue/domain';

export class PostQueueTokenResponse {
  @RestApiStringProperty({
    description: '발급된 queueToken',
    default: 'queueToken',
  })
  queueToken: string;

  @RestApiDateProperty({
    description: '발급 시간',
    default: new Date(),
  })
  issuedAt: Date;

  static of(info: CreateWaitQueueInfo): PostQueueTokenResponse;
  static of(info: CreateWaitQueueInfo[]): PostQueueTokenResponse[];
  static of(
    info: CreateWaitQueueInfo | CreateWaitQueueInfo[],
  ): PostQueueTokenResponse | PostQueueTokenResponse[] {
    if (Array.isArray(info)) return info.map((i) => this.of(i));
    return plainToInstance(PostQueueTokenResponse, { info });
  }
}
