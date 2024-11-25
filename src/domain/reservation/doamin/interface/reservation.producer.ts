import { ReservationOutboxEntity } from '..';

export type SendRequestReservationParam = Pick<
  ReservationOutboxEntity,
  'transactionId' | 'payload' | 'topic'
>;

export abstract class ReservationProducer {
  abstract sendRequestReservation(
    param: SendRequestReservationParam,
  ): Promise<void>;
}
