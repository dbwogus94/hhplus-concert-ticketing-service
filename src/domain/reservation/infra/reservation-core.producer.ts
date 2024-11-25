import { Inject, Injectable } from '@nestjs/common';

import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { KAFKA_CLIENT_NAME } from 'src/common';
import { CustomLoggerService } from 'src/global';
import { ReservationProducer, SendRequestReservationParam } from '../doamin';

@Injectable()
export class ReservationCoreProducer extends ReservationProducer {
  constructor(
    @Inject(KAFKA_CLIENT_NAME)
    private readonly kafkaClient: ClientKafka,
    private readonly logger: CustomLoggerService,
  ) {
    super();
    this.logger.setTarget(this.constructor.name);
  }

  async sendRequestReservation(
    param: SendRequestReservationParam,
  ): Promise<void> {
    const { topic, transactionId, payload } = param;

    const prefix = topic.replaceAll('.', '_');
    try {
      const result = await lastValueFrom(
        this.kafkaClient
          .send(topic, {
            messages: [
              {
                key: `${prefix}_${transactionId}`,
                value: payload,
              },
            ],
          })
          .pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(error as Error);
      return null;
    }
  }
}
