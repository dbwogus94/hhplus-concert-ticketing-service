import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo, UserRequest } from '../constant';

type UserInfoKeys = keyof UserInfo;

export const GetUserInfoDecorator = createParamDecorator(
  (
    data: UserInfoKeys | undefined,
    ctx: ExecutionContext,
  ): UserInfo | UserInfo[UserInfoKeys] => {
    const request: UserRequest = ctx.switchToHttp().getRequest();
    const userInfo: UserInfo = request.user;

    if (data) return userInfo[data];
    return userInfo;
  },
);
