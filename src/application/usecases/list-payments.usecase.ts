import { Inject, Injectable } from '@nestjs/common';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/interfaces/payment-repository.interface';
import { Payment, PaymentFilter } from '../../domain/types/payment.types';

@Injectable()
export class ListPaymentsUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(filter: PaymentFilter): Promise<Payment[]> {
    return this.paymentRepository.findAll(filter);
  }
}
