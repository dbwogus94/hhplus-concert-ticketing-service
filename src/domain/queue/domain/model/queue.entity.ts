import * as crypto from 'crypto';
import { Column, Entity } from 'typeorm';

import { BaseEntity, ConflictStatusException } from 'src/common';
import { QueueStatus } from '../../domain';

@Entity('queue')
export class QueueEntity extends BaseEntity {
  /** 활성화 최대 시간(분) */
  static MAX_ACTIVE_MINUTE: number = 10;

  @Column()
  uid: string;

  @Column('int')
  concertId: number;

  @Column('int')
  userId: number;

  @Column()
  status: QueueStatus;

  @Column('datetime', { nullable: true, comment: '만료시간' })
  activeExpireAt?: Date;

  @Column('datetime', { nullable: true, comment: '활성화된 시간' })
  activedAt?: Date;

  @Column('datetime', { nullable: true, comment: '활성화 후 첫 요청 시간' })
  activeFirstAccessAt?: Date;

  /* ================================ Domain Method ================================ */
  static generateUUIDv4() {
    return crypto.randomUUID();
  }

  /**
   * 활성화 가능 여부
   * @returns {boolean}
   */
  get isActive(): boolean {
    return this.status === QueueStatus.WAIT;
  }

  /**
   * 만료 가능 여부
   * @returns {boolean}
   */
  get isExpire(): boolean {
    return this.status === QueueStatus.WAIT;
  }

  get isFirstAccessAfterActive(): boolean {
    return (
      this.status === QueueStatus.ACTIVE && this.activeFirstAccessAt === null
    );
  }

  /**
   * 큐 활성화 만료시간을 계산하고 셋팅한다.
   * @param currentDate - 현재 시간
   * @returns
   */
  calculateActiveExpire(currentDate: Date = new Date()): this {
    if (this.activeExpireAt) return this;

    const addMinutes = (date: Date, minutes: number) => {
      return new Date(date.getTime() + minutes * 60_000);
    };

    this.activeFirstAccessAt = currentDate;
    this.activeExpireAt = addMinutes(
      this.activeFirstAccessAt,
      QueueEntity.MAX_ACTIVE_MINUTE,
    );
    return this;
  }

  active(): this {
    if (!this.isActive) {
      throw new ConflictStatusException('활성화 가능 상태가 아닙니다.');
    }
    this.status = QueueStatus.ACTIVE;
    return this;
  }

  expire(): this {
    if (!this.isActive) {
      throw new ConflictStatusException('만료 가능 상태가 아닙니다.');
    }
    this.status = QueueStatus.EXPIRE;
    return this;
  }
}
