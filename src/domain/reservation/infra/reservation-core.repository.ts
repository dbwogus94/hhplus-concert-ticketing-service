import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ResourceNotFoundException } from 'src/common';
import {
  FindByOptions,
  ReservationEntity,
  ReservationOutboxEntity,
  ReservationRepository,
  ReservationStatus,
  SaveOutboxParam,
  SaveReservationParam,
} from '../doamin';

@Injectable()
export class ReservationCoreRepository extends ReservationRepository {
  readonly outboxRepo: Repository<ReservationOutboxEntity>;

  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(ReservationEntity, manager);
    this.outboxRepo = manager.getRepository(ReservationOutboxEntity);
  }

  override async findReservationBy(
    options: FindByOptions,
  ): Promise<ReservationEntity> {
    return await this.findOneBy({ ...options });
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

  override async saveOutbox(param: SaveOutboxParam): Promise<void> {
    const outbox = this.outboxRepo.create({
      ...param,
      domainName: 'Reservation',
    });
    await this.outboxRepo.save(outbox);
  }
}
