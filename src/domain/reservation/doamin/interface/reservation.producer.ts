import { ReservationOutboxEntity } from '..';

export type SendRequestReservationParam = Pick<
  ReservationOutboxEntity,
  'transactionId' | 'payload' | 'topic'
>;

export abstract class ReservationProducer {
  abstract emitRequestReservation(param: SendRequestReservationParam): void;
}
