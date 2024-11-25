import {
  Controller,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';

import { KAFKA_CLIENT_NAME } from 'src/common';
import { ConsumRequestReservation } from './dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { QueueFacade } from '../../application';
import { CustomLoggerService } from 'src/global';

@ApiExcludeController()
@Controller()
export class QueueConsumer implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(KAFKA_CLIENT_NAME)
    private readonly kafkaClient: ClientKafka,
    private readonly queueFacade: QueueFacade,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setTarget(this.constructor.name);
  }

  async onModuleInit(): Promise<void> {
    const topics = ['reservation.request.topic'];
    topics.forEach((topic) => this.kafkaClient.subscribeToResponseOf(topic));
    await this.kafkaClient.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.kafkaClient.close();
  }

  /**
      { 
        key: 'reservation_request_topic_15',
        value: '{"id":18,"userId":1,"seatId":18,"price":100000,"status":"Request","queueUid":"de5df21c-7ef6-4413-9d96-71311f6f15a1"}'
      }
  */
  @MessagePattern('reservation.request.topic')
  async handleRequestReservation(@Payload() data: ConsumRequestReservation) {
    this.logger.debug(`handleRequestReservation: ${data}`);
    const outbox = JSON.parse(data.value);
    await this.queueFacade.expireActiveQueue(outbox.queueUid);
  }
}
