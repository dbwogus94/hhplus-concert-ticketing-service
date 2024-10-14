import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common';
import { SeatStatus } from './enum';

@Entity('seat')
export class SeatEntity extends BaseEntity {
  @Column('int')
  performanceId: number;

  @Column('int')
  position: number;

  @Column('int')
  amount: number;

  @Column()
  status: SeatStatus;
}
