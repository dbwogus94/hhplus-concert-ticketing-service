import { Column, Entity, JoinColumn, VersionColumn } from 'typeorm';

import { BaseEntity } from 'src/common';
import { SeatStatus } from './enum';

@Entity('seat')
export class SeatEntity extends BaseEntity {
  @Column('int')
  position: number;

  @Column('int')
  amount: number;

  @Column()
  status: SeatStatus;

  @Column('int')
  @JoinColumn({
    name: 'performanceId',
    foreignKeyConstraintName: 'fk_seat_performanceId',
  })
  performanceId: number;

  @VersionColumn()
  version: number;
}
