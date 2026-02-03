import { Inject, Injectable } from '@nestjs/common';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/interfaces/payment-repository.interface';
import {
  IPaymentGateway,
  PAYMENT_GATEWAY,
} from '../../domain/interfaces/payment-gateway.interface';
import {
  MercadoPagoNotification,
  Payment,
} from '../../domain/types/payment.types';
import { PaymentStatus } from '../../domain/enums/payment.enum';

@Injectable()
export class ProcessWebhookUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(
    notification: MercadoPagoNotification,
  ): Promise<Payment | null> {
    if (notification.type !== 'payment') {
      return null;
    }

    const externalPaymentId = notification.data.id;
    const payment =
      await this.paymentRepository.findByExternalId(externalPaymentId);

    if (!payment) {
      return null;
    }

    const externalStatus =
      await this.paymentGateway.getPaymentStatus(externalPaymentId);
    const status = this.mapExternalStatus(externalStatus);

    return this.paymentRepository.update({
      id: payment.id,
      status,
    });
  }

  private mapExternalStatus(externalStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      approved: PaymentStatus.PAID,
      authorized: PaymentStatus.PAID,
      pending: PaymentStatus.PENDING,
      in_process: PaymentStatus.PENDING,
      rejected: PaymentStatus.FAIL,
      cancelled: PaymentStatus.FAIL,
      refunded: PaymentStatus.FAIL,
    };

    return statusMap[externalStatus] || PaymentStatus.PENDING;
  }
}
