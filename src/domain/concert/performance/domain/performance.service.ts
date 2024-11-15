import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ConflictStatusException, ResourceNotFoundException } from 'src/common';
import { Cache } from 'src/global';
import { EntityManager } from 'typeorm';
import { PerformanceRepository, ReservationRepository } from '../infra';
import { GetPerformancesInfo, GetReservationInfo, GetSeatsInfo } from './dto';
import { SeatStatus } from './model';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly performanceRepo: PerformanceRepository,
    private readonly reservationRepo: ReservationRepository,
    @InjectEntityManager() private readonly manager: EntityManager,
  ) {}

  @Cache({ ttl: 5 })
  async getPerformances(concertId: number): Promise<GetPerformancesInfo[]> {
    const performances =
      await this.performanceRepo.getPerformancesBy(concertId);
    return GetPerformancesInfo.of(performances);
  }

  @Cache({ ttl: 5 })
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

  async getReserveSeat(performanceId: number): Promise<GetSeatsInfo> {
    const seat = await this.performanceRepo.getSeatByPk(performanceId);
    if (seat.isBookComplete)
      throw new ResourceNotFoundException('임시예약 상태의 좌석이 아닙니다.');
    return GetSeatsInfo.of(seat);
  }

  reserveSeat(seatId: number): (manager?: EntityManager) => Promise<void> {
    return async (manager: EntityManager = this.manager) => {
      return await manager.transaction(async (txManager) => {
        const txPerformanceRepo =
          this.performanceRepo.createTransactionRepo(txManager);

        const seat = await txPerformanceRepo.getSeatByPk(seatId);
        seat.reserve();

        await txPerformanceRepo.updateSeatStatus(
          seat.id,
          seat.status,
          seat.version,
        );
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

        await txPerformanceRepo.updateSeatStatus(
          seat.id,
          seat.status,
          seat.version,
        );

        const reservation = await txReservationRepo.getReservationBy({
          seatId,
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
