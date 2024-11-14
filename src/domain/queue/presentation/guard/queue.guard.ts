import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { QueueService } from '../../domain';
import { SERVICE_ACCESS_TOKEN, UserInfo } from 'src/common';

@Injectable()
export class QueueGuard implements CanActivate {
  constructor(private readonly queueService: QueueService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const queueUid: string | undefined = request.headers[SERVICE_ACCESS_TOKEN];
    if (!queueUid) throw new UnauthorizedException();

    const queue = await this.queueService.findActiveQueueFirstAccess(queueUid);
    if (!queue) throw new UnauthorizedException();

    const userInfo: UserInfo = {
      userId: queue.userId,
      queueUid: queue.uid,
      concertId: queue.concertId,
    };

    request.user = userInfo;
    return true;
  }
}
