import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { PointRepository, UserRepository } from '../infra';
import { GetUserInfo, GetUserPointInfo, WriteUserPointCommand } from './dto';
import { PointHistoryType } from './model/enum';

@Injectable()
export class UserService {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly userRepo: UserRepository,
    private readonly pointRepo: PointRepository,
  ) {}

  async getUser(userId: number): Promise<GetUserInfo> {
    const user = await this.userRepo.getUserByPK(userId);
    return GetUserInfo.of(user);
  }

  async getUserPoint(userId: number): Promise<GetUserPointInfo> {
    const user = await this.userRepo.getUserByPK(userId);
    const point = await this.pointRepo.getPointByPk(user.pointId);
    return GetUserPointInfo.of(point);
  }

  async chargeUserPoint(
    command: WriteUserPointCommand,
  ): Promise<GetUserPointInfo> {
    const { amount: chargeAmount, userId } = command;

    return await this.manager.transaction(async (txManager) => {
      const txUser = this.userRepo.createTransactionRepo(txManager);
      const txPointRepo = this.pointRepo.createTransactionRepo(txManager);

      const user = await txUser.getUserByPK(userId);
      const point = await txPointRepo.getPointByPk(user.pointId, {
        lock: { mode: 'pessimistic_write' },
      });

      point.chargePoint(chargeAmount);

      await txPointRepo.updatePointWithHistory(user.pointId, {
        // TODO: type를 넘기는 건 실수하기 너무 좋음, 개선필요
        type: PointHistoryType.CHARGE,
        amount: point.amount,
        userId,
      });
      return GetUserPointInfo.of(point);
    });
  }

  useUserPoint(
    command: WriteUserPointCommand,
  ): (manager?: EntityManager) => Promise<GetUserPointInfo> {
    const { amount: chargeAmount, userId } = command;

    return async (manager: EntityManager = this.manager) => {
      return await manager.transaction(async (txManager) => {
        const txUser = this.userRepo.createTransactionRepo(txManager);
        const txPointRepo = this.pointRepo.createTransactionRepo(txManager);

        const user = await txUser.getUserByPK(userId);
        const point = await txPointRepo.getPointByPk(user.pointId, {
          lock: { mode: 'pessimistic_write' },
        });

        point.usePoint(chargeAmount);

        await txPointRepo.updatePointWithHistory(user.pointId, {
          type: PointHistoryType.USE,
          amount: point.amount,
          userId,
        });
        return GetUserPointInfo.of(point);
      });
    };
  }
}
