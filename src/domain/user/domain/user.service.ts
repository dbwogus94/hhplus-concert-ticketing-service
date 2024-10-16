import { Injectable } from '@nestjs/common';
import { GetUserInfo, GetUserPointInfo, WriteUserPointCommand } from './dto';
import { PointRepository, UserRepository } from '../infra';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly userRepo: UserRepository,
    private readonly pointRepo: PointRepository,
  ) {}

  async getUser(userId: number): Promise<GetUserInfo> {
    // return GetUserInfo.of();
    return;
  }

  async getUserPoint(userId: number): Promise<GetUserPointInfo> {
    return;
  }

  async chargeUserPoint(
    command: WriteUserPointCommand,
  ): Promise<GetUserPointInfo> {
    return;
  }
}
