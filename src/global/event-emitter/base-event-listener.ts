import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export abstract class BaseEventListener {
  static readonly EVENT_GROUP: string;

  constructor(
    readonly eventGroup: string,
    readonly eventEmitter: EventEmitter2,
  ) {}
  abstract errorHandler(err: unknown): void;
}
