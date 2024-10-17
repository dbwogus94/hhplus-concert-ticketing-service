import { QueueEntity } from '../../model';

type WriteReservationCommandProp = {
  readonly concertId: number;
  readonly userId: number;
};

export class WriteQueueCommand
  implements Pick<QueueEntity, 'userId' | 'concertId'>
{
  constructor(readonly prop: WriteReservationCommandProp) {}

  get userId() {
    return this.prop.userId;
  }

  get concertId() {
    return this.prop.concertId;
  }

  static from(prop: WriteReservationCommandProp): WriteQueueCommand {
    return new WriteQueueCommand(prop);
  }
}
