type WriteOutboxCommandProp = {
  readonly transactionId: number;
  readonly domainName: string;
  readonly topic: string;
  readonly payload: string;
};

export class WriteOutboxCommand {
  constructor(private readonly prop: WriteOutboxCommandProp) {}

  get transactionId() {
    return this.prop.transactionId;
  }

  get domainName() {
    return this.prop.domainName;
  }

  get topic() {
    return this.prop.topic;
  }

  get payload() {
    return this.prop.payload;
  }

  /** 여러개의 매개변수 */
  static from(prop: WriteOutboxCommandProp) {
    return new WriteOutboxCommand(prop);
  }
}
