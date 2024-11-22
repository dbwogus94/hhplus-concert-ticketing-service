import { PaymentOutboxEntity } from '../model';

export type EmitPayPaymentParam = Pick<
  PaymentOutboxEntity,
  'transactionId' | 'payload' | 'topic'
>;

export abstract class PaymentProducer {
  abstract emitPayPayment(param: EmitPayPaymentParam): void;
}
