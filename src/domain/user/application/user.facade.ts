import { Injectable } from '@nestjs/common';
import {
  GetUserPointInfo,
  UserService,
  WriteUserPointCommand,
} from '../domain';

@Injectable()
export class UserFacade {
  constructor(private readonly userService: UserService) {}

  async getUserPoint(userId: number): Promise<GetUserPointInfo> {
    const userPointInfo = await this.userService.getUserPoint(userId);
    return userPointInfo;
  }
  async chargeUserPoint(
    command: WriteUserPointCommand,
  ): Promise<GetUserPointInfo> {
    const userPointInfo = await this.userService.chargeUserPoint(command);
    return userPointInfo;
  }
}
