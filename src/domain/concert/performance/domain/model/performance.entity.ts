import { Column, Entity, JoinColumn } from 'typeorm';

import { BaseEntity } from 'src/common';

@Entity('performance')
export class PerformanceEntity extends BaseEntity {
  @Column('date')
  openDate: string;

  @Column('datetime')
  startAt: Date;

  @Column('int')
  @JoinColumn({
    name: 'concertId',
    foreignKeyConstraintName: 'fk_performance_concertId',
  })
  concertId: number;
}
