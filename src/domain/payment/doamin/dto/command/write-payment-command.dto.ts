type WriteUserPointCommandProp = {
  readonly userId: number;
  readonly reservationId: number;
  readonly payPrice: number;
};

export class WritePaymentCommand {
  constructor(private readonly prop: WriteUserPointCommandProp) {}

  get userId() {
    return this.prop.userId;
  }

  get reservationId() {
    return this.prop.reservationId;
  }

  get payPrice() {
    return this.prop.payPrice;
  }

  static from(prop: WriteUserPointCommandProp) {
    return new WritePaymentCommand(prop);
  }
}
