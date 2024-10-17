import { IsString } from 'class-validator';

import { RestApiStringProperty } from 'src/common';

export class PostQueueStateRequest {
  @RestApiStringProperty({
    description: '대기열 토큰(uuid)',
    default: 'waitToken',
  })
  @IsString()
  waitToken: string;
}
