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
export class ReservationConsumer implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(KAFKA_CLIENT_NAME)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    const topics = ['payment.pay.topic'];
    topics.forEach((topic) => this.kafkaClient.subscribeToResponseOf(topic));
    await this.kafkaClient.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.kafkaClient.close();
  }

  @MessagePattern('payment.pay.topic')
  async handlePayPayment(@Payload() data: ConsumRequestReservation) {
    const { payload } = data;
    console.log('handlePayPayment: ', payload);
    return data;
  }
}
