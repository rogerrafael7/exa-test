import { Payment, MercadoPagoPreference } from '../types/payment.types';

export interface IPaymentGateway {
  createPreference(payment: Payment): Promise<MercadoPagoPreference>;
  getPaymentStatus(paymentId: string): Promise<string>;
}

export const PAYMENT_GATEWAY = Symbol('IPaymentGateway');
