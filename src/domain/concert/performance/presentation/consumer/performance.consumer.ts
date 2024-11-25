import {
  Controller,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';

import { KAFKA_CLIENT_NAME } from 'src/common';
import { PerformanceFacade } from '../../application';
import { ConsumPayPayment, ConsumRequestReservation } from './dto';
import { CustomLoggerService } from 'src/global';

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
    private readonly performanceFacade: PerformanceFacade,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setTarget(this.constructor.name);
  }

  async onModuleInit(): Promise<void> {
    Object.values(PerformanceConsumer.Topic).forEach((topic) =>
      this.kafkaClient.subscribeToResponseOf(topic),
    );
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
  @MessagePattern(PerformanceConsumer.Topic.RESERVATION_REQUEST)
  async handleRequestReservation(@Payload() data: ConsumRequestReservation) {
    this.logger.debug(`handleRequestReservation: ${data}`);
    const outbox = JSON.parse(data.value);
    await this.performanceFacade.reserveSeat(outbox.seatId);
  }

  /**
      { 
        key: 'payment_pay_topic_15',
        value: '{"id":10,"userId":1,"reservationId":17,"payPrice":100000,"seatId":17}'
      }
  */
  @MessagePattern(PerformanceConsumer.Topic.PAYMENT_PAY)
  async handlePayPayment(@Payload() data: ConsumPayPayment) {
    this.logger.debug(`handlePayPayment: ${data}`);
    const outbox = JSON.parse(data.value);
    await this.performanceFacade.bookingSeat(outbox.seatId);
  }
}
