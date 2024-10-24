import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRequest } from 'src/common';

export class BaseJwtGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async canActivate(context: ExecutionContext): Promise<boolean> {
    throw new Error('Subclass responsibility');
  }

  protected getRequest<T>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }

  protected getJwt(request: UserRequest): string | null {
    const authorization: string | undefined = request.headers['authorization']; // authorization
    const jwt =
      authorization &&
      authorization.startsWith('Bearer') &&
      authorization.split(' ')[1];

    if (!jwt) throw new UnauthorizedException();
    return jwt;
  }
}
