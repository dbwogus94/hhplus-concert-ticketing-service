import { BaseRepository } from 'src/common';
import { ReservationEntity, ReservationStatus } from '../domain';
import { FindOneOptions } from 'typeorm';

export type InsertReservationParam = Pick<
  ReservationEntity,
  'userId' | 'seatId' | 'price'
>;

export type FindByOptions = Pick<
  Partial<ReservationEntity>,
  'id' | 'userId' | 'seatId'
>;

export type FindOptions = Pick<FindOneOptions, 'lock'> & {
  where: FindByOptions;
};

export abstract class ReservationRepository extends BaseRepository<ReservationEntity> {
  abstract getReservationBy(options: FindByOptions): Promise<ReservationEntity>;
  abstract getReservation(options: FindOptions): Promise<ReservationEntity>;
  abstract insertOne(param: InsertReservationParam): Promise<number>;
  abstract updateReservationStatus(
    reservationId: number,
    status: ReservationStatus,
  ): Promise<void>;
}
