import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ResourceNotFoundException } from 'src/common';
import { PerformanceEntity, SeatEntity, SeatStatus } from '../domain';
import {
  FindLockOptions,
  PerformanceRepository,
} from './performance.repository';

@Injectable()
export class PerformanceCoreRepository extends PerformanceRepository {
  readonly seatRepo: Repository<SeatEntity>;

  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(PerformanceEntity, manager);
    this.seatRepo = manager.getRepository(SeatEntity);
  }

  override async getPerformancesBy(
    concertId: number,
  ): Promise<PerformanceEntity[]> {
    return await this.find({
      where: { concertId },
      order: { id: 'DESC' },
    });
  }

  override async getPerformanceByPk(
    performanceId: number,
  ): Promise<PerformanceEntity> {
    const performance = await this.findOne({
      where: { id: performanceId },
    });
    if (!performance)
      throw new ResourceNotFoundException('공연이 존재하지 않습니다.');
    return performance;
  }

  override async getSeatsBy(
    performanceId: number,
    status: SeatStatus,
  ): Promise<SeatEntity[]> {
    return await this.seatRepo.find({
      where: { performanceId, status },
      order: { id: 'DESC' },
    });
  }

  override async getSeatByPk(
    seatId: number,
    options: FindLockOptions = {},
  ): Promise<SeatEntity> {
    const seat = await this.seatRepo.findOne({
      where: { id: seatId },
      lock: { ...options.lock },
    });
    if (!seat) throw new ResourceNotFoundException();
    return seat;
  }

  override async updateSeatStatus(
    seatId: number,
    status: SeatStatus,
  ): Promise<void> {
    await this.seatRepo.save({ id: seatId, status });
  }
}
