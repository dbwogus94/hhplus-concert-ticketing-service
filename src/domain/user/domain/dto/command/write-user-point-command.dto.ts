type WriteUserPointCommandProp = {
  readonly userId: number;
  readonly amount: number;
};

export class WriteUserPointCommand {
  constructor(private readonly prop: WriteUserPointCommandProp) {}

  get userId() {
    return this.prop.userId;
  }

  get amount() {
    return this.prop.amount;
  }

  static from(prop: WriteUserPointCommandProp) {
    return new WriteUserPointCommand(prop);
  }
}
