import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';

import { GetUserInfo, GetUserPointInfo, WriteUserPointCommand } from './dto';
import { PointRepository, UserRepository } from '../infra';
import { PointHistoryType } from './model/enum';
import { ConflictStatusException } from 'src/common';

@Injectable()
export class UserService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

    return await this.dataSource
      .transaction(async (txManager) => {
        const txUser = this.userRepo.createTransactionRepo(txManager);
        const txPointRepo = this.pointRepo.createTransactionRepo(txManager);

        const user = await txUser.getUserByPK(userId);
        const point = await txPointRepo.getPointByPk(user.pointId, {
          lock: { mode: 'pessimistic_write_or_fail' },
        });

        point.chargePoint(chargeAmount);

        await txPointRepo.updatePointWithHistory(user.pointId, {
          // TODO: type를 넘기는 건 실수하기 너무 좋음, 개선필요
          type: PointHistoryType.CHARGE,
          amount: point.amount,
        });
        return GetUserPointInfo.of(point);
      })
      .catch((error) => {
        if (
          error instanceof QueryFailedError &&
          error.message.includes('NOWAIT')
        )
          throw new ConflictStatusException('포인트 충전 요청 처리중입니다.');
        else throw error;
      });
  }

  async useUserPoint(
    command: WriteUserPointCommand,
  ): Promise<GetUserPointInfo> {
    const { amount: chargeAmount, userId } = command;

    return await this.dataSource
      .transaction(async (txManager) => {
        const txUser = this.userRepo.createTransactionRepo(txManager);
        const txPointRepo = this.pointRepo.createTransactionRepo(txManager);

        const user = await txUser.getUserByPK(userId);
        const point = await txPointRepo.getPointByPk(user.pointId, {
          lock: { mode: 'pessimistic_write_or_fail' },
        });

        point.usePoint(chargeAmount);

        await txPointRepo.updatePointWithHistory(user.pointId, {
          type: PointHistoryType.USE,
          amount: point.amount,
        });
        return GetUserPointInfo.of(point);
      })
      .catch((error) => {
        if (
          error instanceof QueryFailedError &&
          error.message.includes('NOWAIT')
        )
          throw new ConflictStatusException('포인트 사용 요청 처리중입니다.');
        else throw error;
      });
  }
}