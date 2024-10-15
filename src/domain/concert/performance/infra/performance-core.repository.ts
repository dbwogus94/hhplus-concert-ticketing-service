import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { PerformanceEntity, SeatEntity } from '../domain';
import {
  FindSeatOptions,
  PerformanceRepository,
} from './performance.repository';
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
      order: { concertId: 'DESC' },
    });
  }

  override async getSeatsBy(performanceId: number): Promise<SeatEntity[]> {
    return await this.seatRepo.find({
      where: { performanceId },
      order: { performanceId: 'DESC' },
    });
  }

  override async getSeatBy(
    performanceId: number,
    options: FindSeatOptions = {},
  ): Promise<SeatEntity> {
    const seat = await this.seatRepo.findOne({
      where: { performanceId },
      lock: { mode: options.lock },
    });

    if (!seat) throw new ResourceNotFoundException();
    return seat;
  }
}
