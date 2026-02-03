import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Matches,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment.enum';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF must be exactly 11 digits' })
  cpf: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod, {
    message: 'Payment method must be PIX or CREDIT_CARD',
  })
  paymentMethod: PaymentMethod;
}
