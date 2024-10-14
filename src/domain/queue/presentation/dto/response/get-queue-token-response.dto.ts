import {
  RestApiEnumProperty,
  RestApiStringProperty,
  RestApiStringPropertyOptional,
} from 'src/common';
import { QueueStatus } from '../../domain';

export class GetQueueTokenResponse {
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
}
