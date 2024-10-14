import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common';

// TODO: 필요하다면 userId 넣는다.
@Entity('payment')
export class Payment extends BaseEntity {
  @Column('int')
  reservationId: string;

  @Column('int')
  billingPrice: number;

  @Column('int')
  payPrice: number;
}
