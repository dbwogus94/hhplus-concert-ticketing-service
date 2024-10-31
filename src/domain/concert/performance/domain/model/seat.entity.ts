import { Column, Entity, JoinColumn, VersionColumn } from 'typeorm';

import { BaseEntity, ConflictStatusException } from 'src/common';
import { SeatStatus } from './enum';

@Entity('seat')
export class SeatEntity extends BaseEntity {
  static readonly RESERVED_EXPIRE_MIN = 5;

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

  @VersionColumn()
  version: number;

  /* ================================ Domain Method ================================ */
  /**
   * 좌석이 예약 가능한 상태인지 확인합니다.
   * @returns {boolean} 예약 가능 여부
   */
  get isReservable(): boolean {
    return this.status === SeatStatus.AVAILABLE;
  }

  /**
   * 좌석이 예약완료 가능한 상태인지 확인
   * @returns {boolean} 예약 완료 처리 여부
   */
  get isBookComplete(): boolean {
    return this.status === SeatStatus.RESERVED;
  }

  /**
   * 좌석을 예약합니다.
   * @throws {ConflictStatusException} 좌석이 'Available' 상태가 아니라면 에러를 던집니다.
   */
  reserve(): this {
    if (!this.isReservable) {
      throw new ConflictStatusException('좌석을 예약할 수 없는 상태 입니다.');
    }
    this.status = SeatStatus.RESERVED;
    return this;
  }

  /**
   * 좌석을 예약합니다.
   * @throws {ConflictStatusException} 좌석이 'Available' 상태가 아니라면 에러를 던집니다.
   */
  booking(): this {
    if (!this.isBookComplete) {
      throw new ConflictStatusException('좌석이 "임시예약" 상태가 입니다.');
    }
    this.status = SeatStatus.BOOKED;
    return this;
  }
}
