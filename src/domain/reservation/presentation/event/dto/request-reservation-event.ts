type RequestReservationSyncEventProp = {
  reservationId: number;
  payload: string;
};

export class RequestReservationSyncEvent {
  constructor(readonly prop: RequestReservationSyncEventProp) {}

  get reservationId() {
    return this.prop.reservationId;
  }

  get payload() {
    return this.prop.payload;
  }

  static from(prop: RequestReservationSyncEventProp) {
    return new RequestReservationSyncEvent(prop);
  }
}
