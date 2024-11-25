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

@ApiExcludeController()
@Controller()
export class QueueConsumer implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(KAFKA_CLIENT_NAME)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    const topics = ['reservation.request.topic'];
    topics.forEach((topic) => this.kafkaClient.subscribeToResponseOf(topic));
    await this.kafkaClient.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.kafkaClient.close();
  }

  @MessagePattern('reservation.request.topic')
  async handleRequestReservation(@Payload() data: ConsumRequestReservation) {
    const { payload } = data;
    console.log('handleRequestReservation: ', payload);
    return data;
  }
}
