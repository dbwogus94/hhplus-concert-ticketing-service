type ReserveSeatEventProp = { seatId: number };

export class ReserveSeatEvent {
  constructor(readonly prop: ReserveSeatEventProp) {}

  get seatId() {
    return this.prop.seatId;
  }

  static from(prop: ReserveSeatEventProp) {
    return new ReserveSeatEvent(prop);
  }
}
