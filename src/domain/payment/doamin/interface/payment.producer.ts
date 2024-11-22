import { PaymentOutboxEntity } from '../model';

export type SendPayPaymentParam = Pick<
  PaymentOutboxEntity,
  'transactionId' | 'payload' | 'topic'
>;

export abstract class PaymentProducer {
  abstract sendPayPayment(param: SendPayPaymentParam): Promise<void>;
}
