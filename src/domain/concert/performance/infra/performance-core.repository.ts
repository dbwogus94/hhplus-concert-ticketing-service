import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ConflictStatusException, ResourceNotFoundException } from 'src/common';
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
    currentVersion: number,
  ): Promise<void> {
    const updateVersion = currentVersion + 1;

    const result = await this.seatRepo.update(
      {
        id: seatId,
        version: currentVersion, // 버전 체크 조건
      },
      {
        status,
        version: updateVersion, // 버전 증가
      },
    );

    // 개선 예정
    if (result.affected === 0) {
      throw new ConflictStatusException(
        '좌석 예약에 실패했습니다. 다시 시도해주세요.',
      );
    }
  }
}
