import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreatePaymentDto } from '../../domain/dtos/create-payment.dto';
import { UpdatePaymentDto } from '../../domain/dtos/update-payment.dto';
import { FilterPaymentDto } from '../../domain/dtos/filter-payment.dto';
import { MercadoPagoWebhookDto } from '../../domain/dtos/mercado-pago-webhook.dto';
import {
  PaymentMapper,
  PaymentResponse,
} from '../../domain/mappers/payment.mapper';
import {
  CreatePaymentUseCase,
  UpdatePaymentUseCase,
  GetPaymentUseCase,
  ListPaymentsUseCase,
  ProcessWebhookUseCase,
} from '../usecases';

@Controller('api/payment')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePaymentDto): Promise<PaymentResponse> {
    const payment = await this.createPaymentUseCase.execute(dto);
    return PaymentMapper.toResponse(payment);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePaymentDto,
  ): Promise<PaymentResponse> {
    const payment = await this.updatePaymentUseCase.execute({
      id,
      ...dto,
    });
    return PaymentMapper.toResponse(payment);
  }

  @Get(':id')
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PaymentResponse> {
    const payment = await this.getPaymentUseCase.execute(id);
    return PaymentMapper.toResponse(payment);
  }

  @Get()
  async findAll(@Query() filter: FilterPaymentDto): Promise<PaymentResponse[]> {
    const payments = await this.listPaymentsUseCase.execute(filter);
    return PaymentMapper.toResponseList(payments);
  }

  @Post('webhook/mercadopago')
  @HttpCode(HttpStatus.OK)
  async handleMercadoPagoWebhook(
    @Body() dto: MercadoPagoWebhookDto,
  ): Promise<{ received: boolean }> {
    await this.processWebhookUseCase.execute({
      id: dto.id,
      type: dto.type,
      data: dto.data,
    });
    return { received: true };
  }
}
