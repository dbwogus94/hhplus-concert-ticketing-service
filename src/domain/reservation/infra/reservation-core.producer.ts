import { Inject, Injectable } from '@nestjs/common';

import { ClientKafka } from '@nestjs/microservices';
import { retry, tap, timeout } from 'rxjs';
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
  }

  emitRequestReservation(param: SendRequestReservationParam) {
    const { topic, transactionId, payload } = param;

    const prefix = topic.replaceAll('.', '_');
    this.kafkaClient
      .emit(topic, {
        messages: [
          {
            key: `${prefix}_${transactionId}`,
            value: payload,
            partition: 0,
          },
        ],
      })
      .pipe(
        retry(3),
        timeout(5000), // 타임아웃 설정
        tap(this.logger.error),
      );
  }
}
