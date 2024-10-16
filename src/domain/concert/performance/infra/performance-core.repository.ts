import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { PerformanceEntity, SeatEntity, SeatStatus } from '../domain';
import { PerformanceRepository } from './performance.repository';
import { ResourceNotFoundException } from 'src/common';

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

  override async getPerformanceBy(
    performanceId: number,
  ): Promise<PerformanceEntity> {
    const performance = await this.findOne({
      where: { id: performanceId },
    });
    if (!performance) throw new ResourceNotFoundException();
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

  override async getSeatBy(performanceId: number): Promise<SeatEntity> {
    const seat = await this.seatRepo.findOne({
      where: { performanceId },
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
