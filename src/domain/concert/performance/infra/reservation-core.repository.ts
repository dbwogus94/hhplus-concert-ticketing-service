import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { ReservationEntity, ReservationStatus } from '../domain';
import {
  InsertReservationParam,
  ReservationRepository,
} from './reservation.repository';

@Injectable()
export class ReservationCoreRepository extends ReservationRepository {
  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(ReservationEntity, manager);
  }

  override async insertOne(param: InsertReservationParam): Promise<number> {
    const { raw } = await this.insert({
      ...param,
      status: ReservationStatus.REQUEST,
    });
    return raw.insertId;
  }
}
