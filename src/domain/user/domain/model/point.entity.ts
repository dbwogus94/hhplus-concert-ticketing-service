import { BaseEntity, ConflictStatusException } from 'src/common';
import { Column, Entity, VersionColumn } from 'typeorm';

@Entity('point')
export class PointEntity extends BaseEntity {
  static readonly MIN_POINT = 0;

  @Column('int')
  amount: number;

  @VersionColumn()
  version: number;

  /* ================================ Domain Method ================================ */

  chargePoint(addPoint: number): this {
    this.amount += addPoint;
    return this;
  }

  usePoint(subAmount: number): this {
    if (!this.canUsePoint(subAmount)) {
      throw new ConflictStatusException('잔액이 부족합니다.');
    }
    this.amount -= subAmount;
    return this;
  }

  canUsePoint(subAmount: number): boolean {
    return this.amount - subAmount >= PointEntity.MIN_POINT;
  }
}
