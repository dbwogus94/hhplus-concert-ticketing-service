import { PointHistoryType } from '../../model/enum';

type WriteUserPointCommandProp = {
  readonly userId: number;
  readonly amount: number;
  readonly type: PointHistoryType;
};

export class WriteUserPointCommand {
  constructor(private readonly prop: WriteUserPointCommandProp) {}

  get userId() {
    return this.prop.userId;
  }

  get amount() {
    return this.prop.amount;
  }

  get type() {
    return this.prop.type;
  }

  static from(prop: WriteUserPointCommandProp) {
    return new WriteUserPointCommand(prop);
  }
}
