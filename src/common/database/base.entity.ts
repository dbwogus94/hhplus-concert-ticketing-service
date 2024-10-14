import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', comment: 'ID' })
  readonly id: number;

  @CreateDateColumn({ type: 'datetime', comment: '생성일' })
  /** At이 붙는 컬럼은 시분초를 포함하는 datetime 형태의 날짜이다. */
  readonly createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '수정일' })
  /** At이 붙는 컬럼은 시분초를 포함하는 datetime 형태의 날짜이다. */
  readonly updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', comment: '삭제일' })
  /** At이 붙는 컬럼은 시분초를 포함하는 datetime 형태의 날짜이다. */
  deletedAt?: Date | null;
}
