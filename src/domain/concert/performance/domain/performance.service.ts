import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ConflictStatusException } from 'src/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { PerformanceRepository, ReservationRepository } from '../infra';
import {
  GetPerformancesInfo,
  GetSeatsInfo,
  WriteReservationCommand,
} from './dto';
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
    const seat = await this.performanceRepo.getSeatByPk(performanceId);
    return GetSeatsInfo.of(seat);
  }

  /**
   * 예약 과정에서 좌석 상태변경은 비관적락 + NOWAIT 옵션을 사용한다.
   * - `SELECT * FROM table WHERE id = 5 FOR UPDATE NOWAIT;`
   * - 메서드명 reserveSeat으로 변경하자
   * @param command
   * @returns
   */
  async reservationSeat(command: WriteReservationCommand): Promise<number> {
    return await this.dataSource
      .transaction(async (txManager) => {
        const txPerformanceRepo =
          this.performanceRepo.createTransactionRepo(txManager);
        const txReservationRepo =
          this.reservationRepo.createTransactionRepo(txManager);

        // Note: 비관적 락 + nowait 모드로 커넥션을 획득하지 못하면 즉시 에러처리한다.
        const seat = await txPerformanceRepo.getSeatByPk(command.seatId, {
          lock: { mode: 'pessimistic_write_or_fail' },
        });
        seat.reserve();

        await txPerformanceRepo.updateSeatStatus(seat.id, seat.status);
        const reservationId = await txReservationRepo.insertOne({
          seatId: command.seatId,
          userId: command.userId,
        });
        return reservationId;
      })
      .catch((error) => {
        if (
          error instanceof QueryFailedError &&
          error.message.includes('NOWAIT')
        )
          throw new ConflictStatusException('이미 선점된 좌석입니다.');
        else throw error;
      });
  }
}
