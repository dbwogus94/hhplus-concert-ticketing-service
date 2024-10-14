import { BaseEntity } from 'src/common';
import { Column, Entity } from 'typeorm';

@Entity('point')
export class PointEntity extends BaseEntity {
  @Column('int')
  amount: number;
}
