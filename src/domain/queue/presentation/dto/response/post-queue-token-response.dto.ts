import { RestApiDateProperty, RestApiStringProperty } from 'src/common';

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
}
