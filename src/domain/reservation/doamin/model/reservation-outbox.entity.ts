import { BaseOutboxEntity } from 'src/common';
import { Entity } from 'typeorm';

@Entity('reservation_outbox')
export class ReservationOutboxEntity extends BaseOutboxEntity {}
