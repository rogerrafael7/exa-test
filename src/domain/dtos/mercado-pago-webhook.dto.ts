import {
  IsNotEmpty,
  IsString,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class WebhookData {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class MercadoPagoWebhookDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsObject()
  @ValidateNested()
  @Type(() => WebhookData)
  data: WebhookData;
}
