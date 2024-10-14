import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common';
import { ReservationStatus } from './enum';

@Entity('reservation')
export class ReservationEntity extends BaseEntity {
  @Column('int')
  userId: string;

  @Column('int')
  seatId: number;

  @Column()
  status: ReservationStatus;
}
