import { BaseEntity } from './base.entity';
import { Column } from 'typeorm';

export class BaseOutboxEntity extends BaseEntity {
  @Column({ type: 'int', unique: true })
  transactionId: number;

  @Column({ type: 'varchar', length: 100, comment: '발신자' })
  domainName: string;

  @Column({ type: 'varchar', length: 100, comment: '수신자(topic)' })
  topic: string;

  @Column({ type: 'text', comment: 'event payload' })
  payload: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: 0,
    comment: '전송여부',
    transformer: {
      to: (value: boolean) => (value ? 1 : 0),
      from: (value: number) => Boolean(value),
    },
  })
  isSent: boolean;
}
