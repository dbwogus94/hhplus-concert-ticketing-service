import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { ResourceNotFoundException } from 'src/common';
import {
  FindByOptions,
  InsertReservationParam,
  ReservationRepository,
} from './reservation.repository';
import { ReservationEntity, ReservationStatus } from '../doamin';

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

  override async insertOne(param: InsertReservationParam): Promise<number> {
    const { raw } = await this.insert({
      ...param,
      status: ReservationStatus.REQUEST,
    });
    return raw.insertId;
  }

  override async updateReservationStatus(
    reservationId: number,
    status: ReservationStatus,
  ): Promise<void> {
    await this.update(reservationId, { status });
  }
}
