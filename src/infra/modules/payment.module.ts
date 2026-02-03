import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../database/entities/payment.entity';
import { PaymentRepository } from '../database/repositories/payment.repository';
import { MercadoPagoService } from '../services/mercado-pago.service';
import { PaymentController } from '../../application/controllers/payment.controller';
import {
  CreatePaymentUseCase,
  UpdatePaymentUseCase,
  GetPaymentUseCase,
  ListPaymentsUseCase,
  ProcessWebhookUseCase,
} from '../../application/usecases';
import { PAYMENT_REPOSITORY } from '../../domain/interfaces/payment-repository.interface';
import { PAYMENT_GATEWAY } from '../../domain/interfaces/payment-gateway.interface';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  controllers: [PaymentController],
  providers: [
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
    {
      provide: PAYMENT_GATEWAY,
      useClass: MercadoPagoService,
    },
    CreatePaymentUseCase,
    UpdatePaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
    ProcessWebhookUseCase,
  ],
  exports: [PAYMENT_REPOSITORY, PAYMENT_GATEWAY],
})
export class PaymentModule {}
