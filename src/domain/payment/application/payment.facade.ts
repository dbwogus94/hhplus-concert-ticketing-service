import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PerformanceService } from 'src/domain/concert/performance';
import { UserService, WriteUserPointCommand } from 'src/domain/user';
import { GetPaymentInfo, WritePaymentCommand } from '../doamin';
import { PaymentService } from '../doamin/payment.service';
import { WritePaymentCriteria } from './dto';

@Injectable()
export class PaymentFacade {
  constructor(
    @InjectDataSource()
    private readonly paymentService: PaymentService,
    private readonly performanceService: PerformanceService,
    private readonly userService: UserService,
  ) {}

  // TODO: 트랜잭션을 여기서 열어야 하나?
  async payment(criteria: WritePaymentCriteria): Promise<GetPaymentInfo> {
    const { reservationId, userId } = criteria;
    // 예약 확인
    const reservation = await this.performanceService.getSeatReservation(
      reservationId,
      userId,
    );
    const payPrice = reservation.price;

    // 포인트 사용
    await this.userService.useUserPoint(
      WriteUserPointCommand.from({
        userId,
        amount: payPrice,
      }),
    );

    // 좌석 상태 변경과 예약 확정
    await this.performanceService.bookingSeat(reservation.seatId);

    // 결제 생성
    const paymentInfo = await this.paymentService.payment(
      WritePaymentCommand.from({
        userId,
        reservationId,
        payPrice,
      }),
    );
    return paymentInfo;
  }
}
