import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ConflictStatusException } from 'src/common';
import { EntityManager } from 'typeorm';
import { PerformanceRepository, ReservationRepository } from '../infra';
import {
  GetPerformancesInfo,
  GetReservationInfo,
  GetSeatsInfo,
  WriteReservationCommand,
} from './dto';
import { SeatStatus } from './model';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly performanceRepo: PerformanceRepository,
    private readonly reservationRepo: ReservationRepository,
    @InjectEntityManager() private readonly manager: EntityManager,
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

  reserveSeat(
    command: WriteReservationCommand,
  ): (manager?: EntityManager) => Promise<number> {
    return async (manager: EntityManager = this.manager) => {
      return await manager.transaction(async (txManager) => {
        const txPerformanceRepo =
          this.performanceRepo.createTransactionRepo(txManager);
        const txReservationRepo =
          this.reservationRepo.createTransactionRepo(txManager);

        const seat = await txPerformanceRepo.getSeatByPk(command.seatId, {
          lock: { mode: 'pessimistic_write' },
        });
        seat.reserve();

        await txPerformanceRepo.updateSeatStatus(seat.id, seat.status);
        const reservationId = await txReservationRepo.insertOne({
          seatId: command.seatId,
          userId: command.userId,
          price: seat.amount,
        });
        return reservationId;
      });
    };
  }

  getSeatReservation(
    reservationId: number,
    userId: number,
  ): (manager?: EntityManager) => Promise<GetReservationInfo> {
    return async (manager: EntityManager = null) => {
      const txReservationRepo = manager
        ? this.reservationRepo.createTransactionRepo(manager)
        : this.reservationRepo;

      const reservation = await txReservationRepo.getReservationBy({
        id: reservationId,
        userId,
      });
      if (!reservation.isRequest)
        throw new ConflictStatusException('"예약신청" 상태가 아닙니다.');
      return GetReservationInfo.of(reservation);
    };
  }

  bookingSeat(seatId: number): (manager?: EntityManager) => Promise<void> {
    return async (manager: EntityManager = this.manager) => {
      await manager.transaction(async (txManager) => {
        const txPerformanceRepo =
          this.performanceRepo.createTransactionRepo(txManager);
        const txReservationRepo =
          this.reservationRepo.createTransactionRepo(txManager);

        const seat = await txPerformanceRepo.getSeatByPk(seatId);
        seat.booking();
        await txPerformanceRepo.updateSeatStatus(seat.id, seat.status);

        const reservation = await txReservationRepo.getReservation({
          where: {
            seatId,
          },
          lock: { mode: 'pessimistic_write' },
        });
        reservation.confirm();
        await txReservationRepo.updateReservationStatus(
          reservation.id,
          reservation.status,
        );
      });
    };
  }
}
