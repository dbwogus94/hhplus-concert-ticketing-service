import { BaseOutboxEntity } from 'src/common';
import { Entity } from 'typeorm';

@Entity('payment_outbox')
export class PaymentOutboxEntity extends BaseOutboxEntity {}
