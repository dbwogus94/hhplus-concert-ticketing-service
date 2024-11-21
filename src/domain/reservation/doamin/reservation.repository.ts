import { BaseRepository } from 'src/common';
import {
  ReservationEntity,
  ReservationOutboxEntity,
  ReservationStatus,
} from '../doamin';

export type SaveReservationParam = Pick<
  ReservationEntity,
  'userId' | 'seatId' | 'price'
>;

export type SaveOutboxParam = Pick<
  ReservationOutboxEntity,
  'transactionId' | 'topic' | 'payload' | 'isSent'
>;

export type FindByOptions = Pick<
  Partial<ReservationEntity>,
  'id' | 'userId' | 'seatId'
>;

export abstract class ReservationRepository extends BaseRepository<ReservationEntity> {
  abstract findReservationBy(
    options: FindByOptions,
  ): Promise<ReservationEntity>;

  abstract getReservationBy(options: FindByOptions): Promise<ReservationEntity>;
  abstract saveReservation(
    param: SaveReservationParam,
  ): Promise<ReservationEntity>;
  abstract updateReservationStatus(
    reservationId: number,
    status: ReservationStatus,
  ): Promise<void>;

  abstract saveOutbox(param: SaveOutboxParam): Promise<void>;
}
