import {
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
  PaymentFilter,
} from '../types/payment.types';

export interface IPaymentRepository {
  create(data: CreatePaymentInput): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findAll(filter: PaymentFilter): Promise<Payment[]>;
  update(data: UpdatePaymentInput): Promise<Payment>;
  findByExternalId(externalId: string): Promise<Payment | null>;
}

export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');
