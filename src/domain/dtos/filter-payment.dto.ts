import { IsOptional, IsString, IsEnum, Matches } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../enums/payment.enum';

export class FilterPaymentDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF must be exactly 11 digits' })
  cpf?: string;

  @IsOptional()
  @IsEnum(PaymentMethod, {
    message: 'Payment method must be PIX or CREDIT_CARD',
  })
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Status must be PENDING, PAID or FAIL' })
  status?: PaymentStatus;
}
