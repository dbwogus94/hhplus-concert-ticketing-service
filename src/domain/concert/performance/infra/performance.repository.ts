import { FindOneOptions } from 'typeorm';
import { BaseRepository } from 'src/common';
import { PerformanceEntity, SeatEntity, SeatStatus } from '../domain';

export type FindLockOptions = Pick<FindOneOptions, 'lock'>;

export abstract class PerformanceRepository extends BaseRepository<PerformanceEntity> {
  abstract getPerformancesBy(concertId: number): Promise<PerformanceEntity[]>;
  abstract getPerformanceByPk(
    performanceId: number,
  ): Promise<PerformanceEntity>;

  abstract getSeatsBy(
    performanceId: number,
    status: SeatStatus,
  ): Promise<SeatEntity[]>;

  abstract getSeatByPk(
    seatId: number,
    options?: FindLockOptions,
  ): Promise<SeatEntity>;

  abstract updateSeatStatus(seatId: number, status: SeatStatus): Promise<void>;
}
