import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from '../auth.service';
import { BaseJwtGuard } from './base-jwt.guard';
import { UserInfo, UserRequest } from 'src/common';

@Injectable()
export class JwtGuard extends BaseJwtGuard {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest<UserRequest>(context);
    const jwt = this.getJwt(request);
    if (!jwt) throw new UnauthorizedException();

    const payload = this.authService.decodeToken(jwt);
    if (!payload) throw new UnauthorizedException();
    const userInfo: UserInfo = {
      userId: payload.userId,
      queueUid: payload.queueUid,
      jwt,
    };

    request.user = userInfo;
    return true;
  }
}
