type BookingSeatEventProp = { seatId: number };

export class BookingSeatEvent {
  constructor(readonly prop: BookingSeatEventProp) {}

  get seatId() {
    return this.prop.seatId;
  }

  static from(prop: BookingSeatEventProp) {
    return new BookingSeatEvent(prop);
  }
}
