type PayPaymentSyncEventProp = {
  paymentId: number;
  payload: string;
};

export class PayPaymentSyncEvent {
  constructor(readonly prop: PayPaymentSyncEventProp) {}

  get paymentId() {
    return this.prop.paymentId;
  }

  get payload() {
    return this.prop.payload;
  }

  static from(prop: PayPaymentSyncEventProp) {
    return new PayPaymentSyncEvent(prop);
  }
}
