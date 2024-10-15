import { BaseRepository } from 'src/common';
import { ReservationEntity } from '../domain';

export type InsertReservationParam = Pick<
  ReservationEntity,
  'userId' | 'seatId'
>;

export abstract class ReservationRepository extends BaseRepository<ReservationEntity> {
  abstract insertOne(param: InsertReservationParam): Promise<number>;
}
