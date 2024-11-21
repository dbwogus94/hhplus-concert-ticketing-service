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

/*
table outbox { // 보낸 메일함이다. 안보낸거 같으면 졸라 다시 보낼려고
	bigInt id
	발신자(domain name, varchar)
	수신자(topic, varchar)
	제목(Event type, varchar)
	보낸내용(Event, text)

	datetime created_at
	datetime deleted_at
	tinyInt(1) 발송완료 
}
   {
  eventType: string;
  domainName: string;
  topic: string;
  event: string;
  isPublished: boolean;
};
*/
