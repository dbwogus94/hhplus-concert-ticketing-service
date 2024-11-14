import * as crypto from 'crypto';

import { QueueStatus } from './enum';

type WaitQueueDomainProp = {
  uid: string;
  userId: number;
  concertId: number;
  status: QueueStatus;
  timestamp: number;
  waitingNumber: number;
};

/**
 * 대기열 도메인 객체
 */
export class WaitQueueDomain {
  constructor(readonly prop: WaitQueueDomainProp) {}

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

  get waitingNumber(): number {
    return this.prop.waitingNumber;
  }

  /* ================================ Domain Method ================================ */
  static generateUUIDv4() {
    return crypto.randomUUID();
  }

  static from(prop: WaitQueueDomainProp): WaitQueueDomain;
  static from(prop: WaitQueueDomainProp[]): WaitQueueDomain[];
  static from(prop: WaitQueueDomainProp | WaitQueueDomainProp[]) {
    if (Array.isArray(prop)) return prop.map((p) => this.from(p));
    return new WaitQueueDomain(prop);
  }

  // 대기시간 계산

  toLiteral() {
    return this.prop;
  }
}
