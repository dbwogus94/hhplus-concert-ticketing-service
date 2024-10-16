import { BaseEntity } from 'src/common';
import { Column, Entity, JoinColumn } from 'typeorm';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column('int')
  @JoinColumn({
    name: 'pointId',
    foreignKeyConstraintName: 'fk_user_pointId',
  })
  pointId: number;
}
