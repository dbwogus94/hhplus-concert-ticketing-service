import { Column, Entity } from 'typeorm';
import * as crypto from 'crypto';

import { BaseEntity } from 'src/common';
import { QueueStatus } from '../../domain';

@Entity('queue')
export class QueueEntity extends BaseEntity {
  @Column()
  uid: string;

  @Column('int')
  concertId: number;

  @Column('int')
  userId: number;

  @Column()
  status: QueueStatus;

  @Column('datetime', { nullable: true })
  activeExpireAt?: Date;

  @Column('datetime', { nullable: true })
  activeAt?: Date;

  /* ================================ Domain Method ================================ */
  static generateUUIDv4() {
    return crypto.randomUUID();
  }
}
