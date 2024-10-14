import { BaseEntity } from 'src/common';
import { Column, Entity } from 'typeorm';
import { QueueStatus } from '../../presentation/domain';

@Entity('queue')
export class QueueEntity extends BaseEntity {
  @Column('int')
  concertId: number;

  @Column()
  status: QueueStatus;

  @Column('datetime')
  expireAt: Date;

  @Column('datetime')
  activeAt: Date;
}
