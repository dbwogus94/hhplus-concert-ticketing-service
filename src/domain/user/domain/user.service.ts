import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, OptimisticLockVersionMismatchError } from 'typeorm';

import { ConflictStatusException } from 'src/common';
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

    return await this.manager
      .transaction(async (txManager) => {
        const txUser = this.userRepo.createTransactionRepo(txManager);
        const txPointRepo = this.pointRepo.createTransactionRepo(txManager);

        const user = await txUser.getUserByPK(userId);
        const point = await txPointRepo.getPointByPk(user.pointId);
        point.chargePoint(chargeAmount);

        await txPointRepo.updatePointWithHistory(user.pointId, {
          type: PointHistoryType.CHARGE,
          userId,
          amount: point.amount,
          currentVersion: point.version,
        });
        return GetUserPointInfo.of(point);
      })
      .catch((error) => {
        if (error instanceof OptimisticLockVersionMismatchError) {
          throw new ConflictStatusException('포인트 충전 요청 처리중입니다.');
        }
        throw error;
      });
  }

  useUserPoint(
    command: WriteUserPointCommand,
  ): (manager?: EntityManager) => Promise<GetUserPointInfo> {
    const { amount: chargeAmount, userId } = command;

    return async (manager: EntityManager = this.manager) => {
      return await manager
        .transaction(async (txManager) => {
          const txUser = this.userRepo.createTransactionRepo(txManager);
          const txPointRepo = this.pointRepo.createTransactionRepo(txManager);

          const user = await txUser.getUserByPK(userId);
          const point = await txPointRepo.getPointByPk(user.pointId);
          point.usePoint(chargeAmount);

          await txPointRepo.updatePointWithHistory(user.pointId, {
            type: PointHistoryType.USE,
            userId,
            amount: point.amount,
            currentVersion: point.version,
          });
          return GetUserPointInfo.of(point);
        })
        .catch((error) => {
          if (error instanceof OptimisticLockVersionMismatchError) {
            throw new ConflictStatusException('포인트 사용 요청 처리중입니다.');
          }
          throw error;
        });
    };
  }
}
