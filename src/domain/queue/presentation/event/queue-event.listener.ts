import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  BaseEventListener,
  CustomLoggerService,
  OnCustomEvent,
  OnCustomEventErrorHandler,
} from 'src/global';
import { ExpireQueueEvent } from './dto';
import { QueueFacade } from '../../application';

@Injectable()
export class QueueEventListener extends BaseEventListener {
  static readonly EVENT_GROUP = 'queue';
  static readonly EXPIRE = 'queue.expire';

  constructor(
    private readonly logger: CustomLoggerService,
    private readonly queueFacade: QueueFacade,
    eventEmitter: EventEmitter2,
  ) {
    super(QueueEventListener.EVENT_GROUP, eventEmitter);
    this.logger.setTarget(this.constructor.name);
  }

  /**
   * 사용열 만료 이벤트
   * @param event
   */
  @OnCustomEvent(QueueEventListener.EXPIRE, { async: true })
  async handleReserveSeat(event: ExpireQueueEvent) {
    this.logger.debug(`On Handle Event - ${QueueEventListener.EXPIRE}`);
    await this.queueFacade.expireActiveQueue(event.queueUid);
  }

  @OnCustomEventErrorHandler(QueueEventListener.EVENT_GROUP)
  override errorHandler(err: Error): void {
    this.logger.error(err);
  }
}
