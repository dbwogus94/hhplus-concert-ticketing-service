import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common';

@Entity('concert')
export class ConcertEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column('date')
  startDate: string;

  @Column('date')
  endDate: string;
}
