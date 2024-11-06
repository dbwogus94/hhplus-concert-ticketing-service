import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserInfo, UserRequest } from 'src/common';
import { QueueService } from '../../queue/domain/queue.service';
import { AuthService } from '../auth.service';
import { BaseJwtGuard } from './base-jwt.guard';

@Injectable()
export class JwtGuard extends BaseJwtGuard {
  constructor(
    private readonly authService: AuthService,
    private readonly queueService: QueueService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest<UserRequest>(context);
    const jwt = this.getJwt(request);
    const payload = this.authService.decodeToken(jwt);
    if (!payload) throw new UnauthorizedException();

    // 큐 만료 체크
    const queueInfo = await this.queueService.findActiveQueue(payload.queueUid);
    if (!queueInfo) throw new UnauthorizedException();

    const userInfo: UserInfo = {
      userId: payload.userId,
      queueUid: payload.queueUid,
      jwt,
    };
    request.user = userInfo;
    return true;
  }
}
