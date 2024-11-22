import {
  Controller,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';

import { KAFKA_CLIENT_NAME } from 'src/common';
import { ConsumPayPayment, ConsumRequestReservation } from './dto';

@ApiExcludeController()
@Controller()
export class PerformanceConsumer implements OnModuleInit, OnModuleDestroy {
  static readonly Topic = {
    RESERVATION_REQUEST: 'reservation.request.topic',
    PAYMENT_PAY: 'payment.pay.topic',
  };

  constructor(
    @Inject(KAFKA_CLIENT_NAME)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    Object.values(PerformanceConsumer.Topic).forEach((topic) =>
      this.kafkaClient.subscribeToResponseOf(topic),
    );
    await this.kafkaClient.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.kafkaClient.close();
  }

  @MessagePattern(PerformanceConsumer.Topic.RESERVATION_REQUEST)
  async handleRequestReservation(@Payload() data: ConsumRequestReservation) {
    const { payload } = data;
    console.log('handleRequestReservation: ', payload);
    return data;
  }

  @MessagePattern(PerformanceConsumer.Topic.PAYMENT_PAY)
  async handlePayPayment(@Payload() data: ConsumPayPayment) {
    const { payload } = data;
    console.log('handlePayPayment: ', payload);
    return data;
  }
}
