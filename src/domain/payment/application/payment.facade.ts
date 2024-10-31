import { Injectable } from '@nestjs/common';
import { PerformanceService } from 'src/domain/concert/performance';
import { UserService, WriteUserPointCommand } from 'src/domain/user';
import { GetPaymentInfo, WritePaymentCommand } from '../doamin';
import { PaymentService } from '../doamin/payment.service';
import { WritePaymentCriteria } from './dto';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DistributedLockProvider } from 'src/global/distributed-lock/distributed-lock-provider';

@Injectable()
export class PaymentFacade {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly performanceService: PerformanceService,
    private readonly userService: UserService,
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly lockProvider: DistributedLockProvider,
  ) {}

  async payment(criteria: WritePaymentCriteria): Promise<GetPaymentInfo> {
    await this.lockProvider.acquireLock('payment');

    const acquireLock = await this.lockProvider.acquireLock('payment', 30);
    if (acquireLock) {
      try {
        const { reservationId, userId } = criteria;
        return await this.manager.transaction(async (txManager) => {
          // 예약 확인
          const reservation = await this.performanceService.getSeatReservation(
            reservationId,
            userId,
          )(txManager);
          const payPrice = reservation.price;

          // 포인트 사용
          await this.userService.useUserPoint(
            WriteUserPointCommand.from({
              userId,
              amount: payPrice,
            }),
          )(txManager);

          // 좌석 상태 변경과 예약 확정
          await this.performanceService.bookingSeat(reservation.seatId)(
            txManager,
          );

          // 결제 생성
          const paymentInfo = await this.paymentService.payment(
            WritePaymentCommand.from({
              userId,
              reservationId,
              payPrice,
            }),
          )(txManager);
          return paymentInfo;
        });
      } catch (error) {
        throw error;
      } finally {
        await this.lockProvider.releaseLock('payment');
      }
    }
  }
}
