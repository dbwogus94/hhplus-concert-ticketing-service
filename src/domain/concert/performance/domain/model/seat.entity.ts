import { Column, Entity, JoinColumn } from 'typeorm';

import { BaseEntity, ConflictStatusException } from 'src/common';
import { SeatStatus } from './enum';

@Entity('seat')
export class SeatEntity extends BaseEntity {
  @Column('int')
  position: number;

  @Column('int')
  amount: number;

  @Column()
  status: SeatStatus;

  @Column('int')
  @JoinColumn({
    name: 'performanceId',
    foreignKeyConstraintName: 'fk_seat_performanceId',
  })
  performanceId: number;

  /* ================================ Domain Method ================================ */
  /**
   * 좌석이 예약 가능한 상태인지 확인합니다.
   * @returns {boolean} 예약 가능 여부
   */
  isReservable(): boolean {
    return this.status === SeatStatus.AVAILABLE;
  }

  /**
   * 좌석을 예약합니다.
   * @throws {ConflictStatusException} 좌석이 'Available' 상태가 아니라면 에러를 던집니다.
   */
  reserve(): this {
    if (!this.isReservable()) {
      throw new ConflictStatusException('좌석을 예약할 수 없는 상태 입니다.');
    }
    this.status = SeatStatus.RESERVED;
    return this;
  }

  /**
   * 좌석 예약을 확정합니다.
   * @throws {ConflictStatusException} 좌석이 'Reserved' 상태가 아니라면 에러를 던집니다.
   */
  confirmReservation(): this {
    if (this.status !== SeatStatus.RESERVED) {
      throw new ConflictStatusException('좌석 "예약" 상태가 아닙니다.');
    }
    this.status = SeatStatus.BOOKED;
    return this;
  }
}
