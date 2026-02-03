import { Payment } from '../types/payment.types';

export type PaymentResponse = {
  id: string;
  cpf: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export class PaymentMapper {
  static toResponse(payment: Payment): PaymentResponse {
    return {
      id: payment.id,
      cpf: payment.cpf,
      description: payment.description,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }

  static toResponseList(payments: Payment[]): PaymentResponse[] {
    return payments.map((payment) => PaymentMapper.toResponse(payment));
  }
}
