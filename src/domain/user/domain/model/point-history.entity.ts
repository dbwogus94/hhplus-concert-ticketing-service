import { BaseEntity } from 'src/common';
import { Column, Entity, JoinColumn } from 'typeorm';
import { PointHistoryType } from './enum/point-history-type.enum';

@Entity('point_history')
export class PointHistoryEntity extends BaseEntity {
  @Column('int')
  amount: number;

  @Column()
  type: PointHistoryType;

  @Column('int')
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'fk_point_history_userId',
  })
  userId: number;
}
