import { PaymentMethod, PaymentStatus } from '../enums/payment.enum';

export type Payment = {
  id: string;
  cpf: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePaymentInput = {
  cpf: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
};

export type UpdatePaymentInput = {
  id: string;
  status?: PaymentStatus;
  description?: string;
  externalId?: string;
};

export type PaymentFilter = {
  cpf?: string;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
};

export type MercadoPagoPreference = {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
};

export type MercadoPagoNotification = {
  id: string;
  type: string;
  data: {
    id: string;
  };
};
