type ConfirmReservationEventProp = { reservationId: number };

export class ConfirmReservationEvent {
  constructor(readonly prop: ConfirmReservationEventProp) {}

  get reservationId() {
    return this.prop.reservationId;
  }

  static from(prop: ConfirmReservationEventProp) {
    return new ConfirmReservationEvent(prop);
  }
}
