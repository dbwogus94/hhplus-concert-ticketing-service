import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { ResourceNotFoundException } from 'src/common';
import { ReservationEntity, ReservationStatus } from '../doamin';
import {
  FindByOptions,
  ReservationRepository,
  SaveReservationParam,
} from './reservation.repository';

@Injectable()
export class ReservationCoreRepository extends ReservationRepository {
  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(ReservationEntity, manager);
  }

  override async getReservationBy(
    options: FindByOptions = {},
  ): Promise<ReservationEntity> {
    const reservation = await this.findOneBy({
      ...options,
    });
    if (!reservation)
      throw new ResourceNotFoundException('예약이 존재하지 않습니다.');
    return reservation;
  }

  override async saveReservation(
    param: SaveReservationParam,
  ): Promise<ReservationEntity> {
    const reservation = this.create(param);
    await this.save(reservation);
    return reservation;
  }

  override async updateReservationStatus(
    reservationId: number,
    status: ReservationStatus,
  ): Promise<void> {
    await this.update(reservationId, { status });
  }
}
