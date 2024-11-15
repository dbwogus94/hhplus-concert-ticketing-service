import { BaseRepository } from 'src/common';
import { ReservationEntity, ReservationStatus } from '../doamin';

export type InsertReservationParam = Pick<
  ReservationEntity,
  'userId' | 'seatId' | 'price'
>;

export type FindByOptions = Pick<
  Partial<ReservationEntity>,
  'id' | 'userId' | 'seatId'
>;

export abstract class ReservationRepository extends BaseRepository<ReservationEntity> {
  abstract getReservationBy(options: FindByOptions): Promise<ReservationEntity>;
  abstract insertOne(param: InsertReservationParam): Promise<number>;
  abstract updateReservationStatus(
    reservationId: number,
    status: ReservationStatus,
  ): Promise<void>;
}
