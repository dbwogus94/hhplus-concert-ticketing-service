import { Injectable } from '@nestjs/common';
import {
  GetUserPointInfo,
  UserService,
  WriteUserPointCommand,
} from '../domain';
import { DistributedLockProvider } from 'src/global/distributed-lock/distributed-lock-provider';

@Injectable()
export class UserFacade {
  constructor(
    private readonly userService: UserService,
    private readonly lockProvider: DistributedLockProvider,
  ) {}

  async getUserPoint(userId: number): Promise<GetUserPointInfo> {
    const userPointInfo = await this.userService.getUserPoint(userId);
    return userPointInfo;
  }

  async chargeUserPoint(
    command: WriteUserPointCommand,
  ): Promise<GetUserPointInfo> {
    return await this.lockProvider.withMutex('chargeUserPoint', async () => {
      const userPointInfo = await this.userService.chargeUserPoint(command);
      return userPointInfo;
    });
  }
}
