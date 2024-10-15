import { BaseRepository } from 'src/common';
import { PerformanceEntity, SeatEntity } from '../domain';

export type FindSeatOptions = {
  lock?: 'pessimistic_read' | 'pessimistic_write';
};

export abstract class PerformanceRepository extends BaseRepository<PerformanceEntity> {
  abstract getPerformancesBy(concertId: number): Promise<PerformanceEntity[]>;
  abstract getSeatsBy(performanceId: number): Promise<SeatEntity[]>;
  abstract getSeatBy(
    performanceId: number,
    options?: FindSeatOptions,
  ): Promise<SeatEntity>;
}
