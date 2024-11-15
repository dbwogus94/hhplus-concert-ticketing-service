type ExpireQueueEventProp = { queueUid: string };

export class ExpireQueueEvent {
  constructor(readonly prop: ExpireQueueEventProp) {}

  get queueUid() {
    return this.prop.queueUid;
  }

  static from(prop: ExpireQueueEventProp) {
    return new ExpireQueueEvent(prop);
  }
}
