type WriteReservationCommandProp = {
  readonly userId: number;
  readonly performanceId: number;
  readonly seatId: number;
  readonly queueUid: string;
};

export class WriteReservationCommand {
  constructor(private readonly prop: WriteReservationCommandProp) {}

  get performanceId() {
    return this.prop.performanceId;
  }

  get seatId() {
    return this.prop.seatId;
  }

  get userId() {
    return this.prop.userId;
  }

  get queueUid() {
    return this.prop.queueUid;
  }

  /** 여러개의 매개변수 */
  static from(prop: WriteReservationCommandProp) {
    return new WriteReservationCommand(prop);
  }
}
