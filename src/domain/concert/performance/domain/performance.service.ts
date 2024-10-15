import { Injectable } from '@nestjs/common';
import { PerformanceRepository, ReservationRepository } from '../infra';
import {
  GetPerformancesInfo,
  GetSeatsInfo,
  WriteReservationCommand,
} from './dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';
import { ConflictStatusException } from 'src/common';
import { SeatStatus } from './model';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly performanceRepo: PerformanceRepository,
    private readonly reservationRepo: ReservationRepository,
  ) {}

  async getPerformances(concertId: number): Promise<GetPerformancesInfo[]> {
    const performances =
      await this.performanceRepo.getPerformancesBy(concertId);
    return GetPerformancesInfo.of(performances);
  }

  // async getPerformance(performanceId: number): Promise<GetPerformancesInfo> {
  //   const performance =
  //     await this.performanceRepo.getPerformanceBy(performanceId);
  //   return GetPerformancesInfo.of(performance);
  // }

  async getAvailableSeats(performanceId: number): Promise<GetSeatsInfo[]> {
    const seats = await this.performanceRepo.getSeatsBy(
      performanceId,
      SeatStatus.AVAILABLE,
    );
    return GetSeatsInfo.of(seats);
  }

  async getSeat(performanceId: number): Promise<GetSeatsInfo> {
    const seat = await this.performanceRepo.getSeatBy(performanceId);
    return GetSeatsInfo.of(seat);
  }

  /**
   * 좌석 상태 변경에는 낙관적 락을 사용한다.
   * @param command
   * @returns
   */
  async reservationSeat(command: WriteReservationCommand): Promise<number> {
    const seat = await this.performanceRepo.getSeatBy(command.seatId);
    if (seat.status !== SeatStatus.AVAILABLE)
      throw new ConflictStatusException('좌석을 예약할 수 없는 상태 입니다.');

    try {
      return await this.dataSource.transaction(async (txManager) => {
        const txPerformanceRepo =
          this.performanceRepo.createTransactionRepo(txManager);
        const txReservationRepo =
          this.reservationRepo.createTransactionRepo(txManager);

        // NOTE: save에서 낙관적 락 동작한다.
        await txPerformanceRepo.updateSeatStatus(seat.id, SeatStatus.RESERVED);
        const reservationId = await txReservationRepo.insertOne({
          seatId: command.seatId,
          userId: command.userId,
        });
        return reservationId;
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictStatusException('좌석을 예약할 수 없는 상태 입니다.');
      }
      throw error;
    }
  }
}
