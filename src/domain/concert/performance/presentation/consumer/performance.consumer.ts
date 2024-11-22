import { Controller, Inject } from '@nestjs/common';
import { ClientKafka, MessagePattern } from '@nestjs/microservices';

import { KAFKA_CLIENT_NAME } from 'src/common';
import { ConsumRequestReservation } from './dto';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class PerformanceConsumer {
  constructor(
    @Inject(KAFKA_CLIENT_NAME)
    private readonly kafkaClient: ClientKafka,
  ) {}

  @MessagePattern('reservation.request.topic')
  async handleRequestReservation(data: ConsumRequestReservation) {
    const { payload } = data;
    console.log('handleRequestReservation: ', payload);
    return data;
  }
}
