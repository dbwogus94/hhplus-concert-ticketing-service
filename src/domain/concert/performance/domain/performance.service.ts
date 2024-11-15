import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { ResourceNotFoundException } from 'src/common';
import { Cache } from 'src/global';
import { PerformanceRepository } from '../infra';
import { GetPerformancesInfo, GetSeatsInfo } from './dto';
import { SeatStatus } from './model';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly performanceRepo: PerformanceRepository,
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

  async reserveSeat(seatId: number): Promise<void> {
    const seat = await this.performanceRepo.getSeatByPk(seatId);
    seat.reserve();
    await this.performanceRepo.updateSeatStatus(
      seat.id,
      seat.status,
      seat.version,
    );
  }

  async bookingSeat(seatId: number): Promise<void> {
    const seat = await this.performanceRepo.getSeatByPk(seatId);
    seat.booking();

    await this.performanceRepo.updateSeatStatus(
      seat.id,
      seat.status,
      seat.version,
    );
  }
}
