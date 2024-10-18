import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common';

// TODO: 필요하다면 userId 넣는다.
@Entity('payment')
export class PaymentEntity extends BaseEntity {
  @Column('int')
  userId: number;

  @Column('int')
  reservationId: number;

  @Column('int')
  payPrice: number;
}
