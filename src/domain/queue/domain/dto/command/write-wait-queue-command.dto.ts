import { WaitQueueDomain } from '../../model';

type WriteReservationCommandProp = {
  readonly concertId: number;
  readonly userId: number;
};

export class WriteWaitQueueCommand
  implements Pick<WaitQueueDomain, 'userId' | 'concertId'>
{
  constructor(readonly prop: WriteReservationCommandProp) {}

  get userId() {
    return this.prop.userId;
  }

  get concertId() {
    return this.prop.concertId;
  }

  static from(prop: WriteReservationCommandProp): WriteWaitQueueCommand {
    return new WriteWaitQueueCommand(prop);
  }
}
