import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaymentStatus } from '../enums/payment.enum';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Status must be PENDING, PAID or FAIL' })
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  description?: string;
}
