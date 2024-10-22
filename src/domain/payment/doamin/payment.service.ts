import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';
import { PaymentRepository } from '../infra';
import { GetPaymentInfo, WritePaymentCommand } from './dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly asyncStorge: AsyncLocalStorage<{
      txManager: EntityManager;
    }>,
  ) {}

  async payment(command: WritePaymentCommand): Promise<GetPaymentInfo> {
    // asyncStorage에 트랜잭션 커넥션 가져오기
    const txManager = this.asyncStorge.getStore()?.txManager;
    const paymentRepo = txManager
      ? this.paymentRepo.createTransactionRepo(txManager)
      : this.paymentRepo;

    const payment = await paymentRepo.savePayment(command);
    return GetPaymentInfo.of(payment);
  }

  //
  // payment(command: WritePaymentCommand): () => Promise<GetPaymentInfo> {
  //   return async (manager: EntityManager = null) => {
  //     const paymentRepo = manager
  //       ? this.paymentRepo.createTransactionRepo(manager)
  //       : this.paymentRepo;

  //     const payment = await paymentRepo.savePayment(command);
  //     return GetPaymentInfo.of(payment);
  //   };
  // }
}
