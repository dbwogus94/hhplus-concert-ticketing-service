import { Column, Entity } from 'typeorm';

import { BaseEntity, ConflictStatusException } from 'src/common';
import { ReservationStatus } from './enum';

@Entity('reservation')
export class ReservationEntity extends BaseEntity {
  @Column('int')
  userId: number;

  @Column('int')
  seatId: number;

  @Column('int')
  price: number;

  @Column()
  status: ReservationStatus;

  /* ================================ Domain Method ================================ */
  /**
   * 예약 상태인지 확인
   * @returns {boolean} 예약 가능 여부
   */
  get isRequest(): boolean {
    return this.status === ReservationStatus.REQUEST;
  }

  confirm(): this {
    if (!this.isRequest) {
      throw new ConflictStatusException('"예약신청" 상태가 아닙니다.');
    }

    this.status = ReservationStatus.CONFIRM;
    return this;
  }
}
