import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common';

@Entity('performance')
export class PerformanceEntity extends BaseEntity {
  @Column('int')
  concertId: number;

  @Column('date')
  openDate: string;

  @Column('datetime')
  startAt: Date;
}
