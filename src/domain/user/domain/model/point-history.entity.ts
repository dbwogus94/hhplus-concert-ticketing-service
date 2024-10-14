import { BaseEntity } from 'src/common';
import { Column, Entity } from 'typeorm';
import { PointHistoryType } from './enum/point-history-type.enum';

@Entity('point_history')
export class PointHistoryEntity extends BaseEntity {
  @Column('int')
  userId: number;

  @Column('int')
  amount: number;

  @Column()
  type: PointHistoryType;
}
