import { BaseRepository } from 'src/common';
import { PerformanceEntity, SeatEntity, SeatStatus } from '../domain';

export abstract class PerformanceRepository extends BaseRepository<PerformanceEntity> {
  abstract getPerformancesBy(concertId: number): Promise<PerformanceEntity[]>;
  abstract getPerformanceBy(performanceId: number): Promise<PerformanceEntity>;

  abstract getSeatsBy(
    performanceId: number,
    status: SeatStatus,
  ): Promise<SeatEntity[]>;
  abstract getSeatBy(performanceId: number): Promise<SeatEntity>;
  abstract updateSeatStatus(seatId: number, status: SeatStatus): Promise<void>;
}
