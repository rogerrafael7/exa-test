import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IPaymentGateway } from '../../domain/interfaces/payment-gateway.interface';
import {
  Payment,
  MercadoPagoPreference,
} from '../../domain/types/payment.types';
import { env } from '../../config/env';

interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

interface MercadoPagoPaymentResponse {
  status: string;
}

@Injectable()
export class MercadoPagoService implements IPaymentGateway {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.mercadopago.com',
      headers: {
        Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createPreference(payment: Payment): Promise<MercadoPagoPreference> {
    try {
      const response: AxiosResponse<MercadoPagoPreferenceResponse> =
        await this.client.post('/checkout/preferences', {
          items: [
            {
              title: payment.description,
              quantity: 1,
              unit_price: payment.amount,
              currency_id: 'BRL',
            },
          ],
          external_reference: payment.id,
          notification_url: env.MERCADO_PAGO_WEBHOOK_URL,
          back_urls: {
            success: `${env.MERCADO_PAGO_WEBHOOK_URL}/success`,
            failure: `${env.MERCADO_PAGO_WEBHOOK_URL}/failure`,
            pending: `${env.MERCADO_PAGO_WEBHOOK_URL}/pending`,
          },
          auto_return: 'approved',
        });

      return {
        id: response.data.id,
        initPoint: response.data.init_point,
        sandboxInitPoint: response.data.sandbox_init_point,
      };
    } catch {
      throw new HttpException(
        'Failed to create Mercado Pago preference',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const response: AxiosResponse<MercadoPagoPaymentResponse> =
        await this.client.get(`/v1/payments/${paymentId}`);
      return response.data.status;
    } catch {
      throw new HttpException(
        'Failed to get payment status from Mercado Pago',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
