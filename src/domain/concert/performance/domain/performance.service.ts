import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AsyncLocalStorage } from 'async_hooks';
import { ConflictStatusException } from 'src/common';
import { EntityManager, QueryFailedError } from 'typeorm';
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
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly performanceRepo: PerformanceRepository,
    private readonly reservationRepo: ReservationRepository,
    private readonly asyncStorge: AsyncLocalStorage<{
      txManager: EntityManager;
    }>,
  ) {}

  async getPerformances(concertId: number): Promise<GetPerformancesInfo[]> {
    const performances =
      await this.performanceRepo.getPerformancesBy(concertId);
    return GetPerformancesInfo.of(performances);
  }

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
  async reserveSeat(command: WriteReservationCommand): Promise<number> {
    const manager = this.asyncStorge.getStore()?.txManager ?? this.manager;
    return await manager
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
          price: seat.amount,
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

  async getSeatReservation(reservationId: number, userId: number) {
    const txManager = this.asyncStorge.getStore()?.txManager;
    const reservationRepo = txManager
      ? this.reservationRepo.createTransactionRepo(txManager)
      : this.reservationRepo;

    const reservation = await reservationRepo.getReservationBy({
      id: reservationId,
      userId,
    });
    if (!reservation.isRequest)
      throw new ConflictStatusException('"예약신청" 상태가 아닙니다.');
    return reservation;
  }

  async bookingSeat(seatId: number): Promise<void> {
    const manager = this.asyncStorge.getStore()?.txManager ?? this.manager;
    await manager.transaction(async (txManager) => {
      const txPerformanceRepo =
        this.performanceRepo.createTransactionRepo(txManager);
      const txReservationRepo =
        this.reservationRepo.createTransactionRepo(txManager);

      const seat = await txPerformanceRepo.getSeatByPk(seatId);
      seat.booking();
      await txPerformanceRepo.updateSeatStatus(seat.id, seat.status);

      const reservation = await txReservationRepo.getReservationBy({ seatId });
      reservation.confirm();
      await txReservationRepo.updateReservationStatus(
        reservation.id,
        reservation.status,
      );
    });
  }
}
