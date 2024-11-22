import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { ApiExcludeController } from '@nestjs/swagger';
import { ConsumRequestReservation } from './dto';

@ApiExcludeController()
@Controller()
export class QueueConsumer {
  @MessagePattern('reservation.request.topic')
  async handleRequestReservation(data: ConsumRequestReservation) {
    const { payload } = data;
    console.log('handleRequestReservation: ', payload);
    return data;
  }
}
