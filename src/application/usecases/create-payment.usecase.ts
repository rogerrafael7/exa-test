import { Inject, Injectable } from '@nestjs/common';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/interfaces/payment-repository.interface';
import {
  IPaymentGateway,
  PAYMENT_GATEWAY,
} from '../../domain/interfaces/payment-gateway.interface';
import { CreatePaymentInput, Payment } from '../../domain/types/payment.types';
import { PaymentMethod } from '../../domain/enums/payment.enum';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(input: CreatePaymentInput): Promise<Payment> {
    const payment = await this.paymentRepository.create({
      ...input,
    });

    if (input.paymentMethod === PaymentMethod.CREDIT_CARD) {
      const preference = await this.paymentGateway.createPreference(payment);

      await this.paymentRepository.update({
        id: payment.id,
        externalId: preference.id,
      });

      return {
        ...payment,
        externalId: preference.id,
      };
    }

    return payment;
  }
}
