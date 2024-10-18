type WritePaymentCriteriaProp = {
  readonly userId: number;
  readonly reservationId: number;
};

export class WritePaymentCriteria {
  constructor(private readonly prop: WritePaymentCriteriaProp) {}

  get userId() {
    return this.prop.userId;
  }

  get reservationId() {
    return this.prop.reservationId;
  }

  static from(prop: WritePaymentCriteriaProp) {
    return new WritePaymentCriteria(prop);
  }
}
