import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/interfaces/payment-repository.interface';
import { UpdatePaymentInput, Payment } from '../../domain/types/payment.types';

@Injectable()
export class UpdatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(input: UpdatePaymentInput): Promise<Payment> {
    const existingPayment = await this.paymentRepository.findById(input.id);

    if (!existingPayment) {
      throw new NotFoundException(`Payment with id ${input.id} not found`);
    }

    return this.paymentRepository.update(input);
  }
}
