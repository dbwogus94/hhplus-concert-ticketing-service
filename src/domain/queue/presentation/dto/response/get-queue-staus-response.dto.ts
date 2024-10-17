import {
  RestApiEnumProperty,
  RestApiStringProperty,
  RestApiStringPropertyOptional,
} from 'src/common';
import { QueueStatus } from '../../../domain';
import { plainToInstance } from 'class-transformer';
import { QueueStatusResult } from 'src/domain/queue/application/dto';

export class PostQueueStateResponse {
  @RestApiStringProperty({
    description: '발급된 queueToken',
    default: 'queueToken',
  })
  waitingNumber: number;

  @RestApiEnumProperty(QueueStatus, {
    description: '큐 상태',
    default: QueueStatus.WAIT,
  })
  state: QueueStatus;

  @RestApiStringPropertyOptional({
    description: 'ACTIVE인 경우 발급되는 서비스 accessToken',
    default: 'jwt',
  })
  accessToken?: string | null;

  static of(result: QueueStatusResult): PostQueueStateResponse;
  static of(result: QueueStatusResult[]): PostQueueStateResponse[];
  static of(
    result: QueueStatusResult | QueueStatusResult[],
  ): PostQueueStateResponse | PostQueueStateResponse[] {
    if (Array.isArray(result)) return result.map((i) => this.of(i));
    return plainToInstance(PostQueueStateResponse, { result });
  }
}
