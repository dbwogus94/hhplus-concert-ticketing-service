type WriteReservationCriteriaProp = {
  readonly userId: number;
  readonly performanceId: number;
  readonly seatId: number;
};

export class WriteReservationCriteria {
  constructor(private readonly prop: WriteReservationCriteriaProp) {}

  get performanceId() {
    return this.prop.performanceId;
  }

  get seatId() {
    return this.prop.seatId;
  }

  get userId() {
    return this.prop.userId;
  }

  static from(prop: WriteReservationCriteriaProp) {
    return new WriteReservationCriteria(prop);
  }
}
