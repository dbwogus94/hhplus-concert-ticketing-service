import * as crypto from 'crypto';

import { ConflictStatusException } from 'src/common';
import { QueueStatus } from './enum';

type ActiveQueueDomainProp = {
  uid: string;
  userId: number;
  concertId: number;
  status: QueueStatus;
  timestamp: number;
  activedAt?: Date;
  activeFirstAccessAt?: Date;
};

export class ActiveQueueDomain {
  constructor(readonly prop: ActiveQueueDomainProp) {}

  /** 활성화 최대 시간(분) - 5분 */
  static MAX_ACTIVE_MINUTE: number = 5 * 60;

  get uid(): string {
    return this.prop.uid;
  }

  get userId(): number {
    return this.prop.userId;
  }

  get concertId(): number {
    return this.prop.concertId;
  }

  get status(): QueueStatus {
    return this.prop.status;
  }

  get timestamp(): number {
    return this.prop.timestamp;
  }

  get activedAt(): Date | null {
    return this.prop.activedAt;
  }

  get activeFirstAccessAt(): Date | null {
    return this.prop.activeFirstAccessAt;
  }

  /* ================================ Domain Method ================================ */
  static generateUUIDv4() {
    return crypto.randomUUID();
  }

  static from(prop: ActiveQueueDomainProp): ActiveQueueDomain;
  static from(prop: ActiveQueueDomainProp[]): ActiveQueueDomain[];
  static from(prop: ActiveQueueDomainProp | ActiveQueueDomainProp[]) {
    if (Array.isArray(prop)) return prop.map((p) => this.from(p));
    return new ActiveQueueDomain(prop);
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

  active(activedAt: Date = new Date()): this {
    if (!this.isActive) {
      throw new ConflictStatusException('활성화 가능 상태가 아닙니다.');
    }
    this.prop.status = QueueStatus.ACTIVE;
    this.prop.activedAt = activedAt;
    return this;
  }

  firstAccess(activeFirstAccessAt: Date = new Date()): this {
    if (!this.isActive) {
      throw new ConflictStatusException('활성화 상태가 아닙니다.');
    }
    this.prop.activeFirstAccessAt = activeFirstAccessAt;
    return this;
  }

  expire(): this {
    if (!this.isActive) {
      throw new ConflictStatusException('만료 가능 상태가 아닙니다.');
    }
    this.prop.status = QueueStatus.EXPIRE;
    return this;
  }

  toLiteral() {
    return this.prop;
  }
}
