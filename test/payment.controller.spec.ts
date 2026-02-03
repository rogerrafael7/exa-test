import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../src/application/controllers/payment.controller';
import {
  CreatePaymentUseCase,
  UpdatePaymentUseCase,
  GetPaymentUseCase,
  ListPaymentsUseCase,
  ProcessWebhookUseCase,
} from '../src/application/usecases';
import { PaymentMethod, PaymentStatus } from '../src/domain/enums/payment.enum';
import { Payment } from '../src/domain/types/payment.types';

describe('PaymentController', () => {
  let controller: PaymentController;
  let createPaymentUseCase: CreatePaymentUseCase;
  let updatePaymentUseCase: UpdatePaymentUseCase;
  let getPaymentUseCase: GetPaymentUseCase;
  let listPaymentsUseCase: ListPaymentsUseCase;
  let processWebhookUseCase: ProcessWebhookUseCase;

  const mockPayment: Payment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    cpf: '12345678901',
    description: 'Test payment',
    amount: 100.0,
    paymentMethod: PaymentMethod.PIX,
    status: PaymentStatus.PENDING,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: CreatePaymentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdatePaymentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetPaymentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListPaymentsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ProcessWebhookUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    createPaymentUseCase =
      module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
    updatePaymentUseCase =
      module.get<UpdatePaymentUseCase>(UpdatePaymentUseCase);
    getPaymentUseCase = module.get<GetPaymentUseCase>(GetPaymentUseCase);
    listPaymentsUseCase = module.get<ListPaymentsUseCase>(ListPaymentsUseCase);
    processWebhookUseCase = module.get<ProcessWebhookUseCase>(
      ProcessWebhookUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      jest
        .spyOn(createPaymentUseCase, 'execute')
        .mockResolvedValue(mockPayment);

      const result = await controller.create({
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
      });

      expect(result.id).toBe(mockPayment.id);
      expect(result.cpf).toBe(mockPayment.cpf);
      expect(createPaymentUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing payment', async () => {
      const updatedPayment = { ...mockPayment, status: PaymentStatus.PAID };
      jest
        .spyOn(updatePaymentUseCase, 'execute')
        .mockResolvedValue(updatedPayment);

      const result = await controller.update(mockPayment.id, {
        status: PaymentStatus.PAID,
      });

      expect(result.status).toBe(PaymentStatus.PAID);
      expect(updatePaymentUseCase.execute).toHaveBeenCalledWith({
        id: mockPayment.id,
        status: PaymentStatus.PAID,
      });
    });
  });

  describe('findById', () => {
    it('should return a payment by id', async () => {
      jest.spyOn(getPaymentUseCase, 'execute').mockResolvedValue(mockPayment);

      const result = await controller.findById(mockPayment.id);

      expect(result.id).toBe(mockPayment.id);
      expect(getPaymentUseCase.execute).toHaveBeenCalledWith(mockPayment.id);
    });
  });

  describe('findAll', () => {
    it('should return all payments', async () => {
      jest
        .spyOn(listPaymentsUseCase, 'execute')
        .mockResolvedValue([mockPayment]);

      const result = await controller.findAll({});

      expect(result).toHaveLength(1);
      expect(listPaymentsUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should return payments filtered by CPF', async () => {
      jest
        .spyOn(listPaymentsUseCase, 'execute')
        .mockResolvedValue([mockPayment]);

      const result = await controller.findAll({ cpf: '12345678901' });

      expect(result).toHaveLength(1);
      expect(listPaymentsUseCase.execute).toHaveBeenCalledWith({
        cpf: '12345678901',
      });
    });
  });

  describe('handleMercadoPagoWebhook', () => {
    it('should process webhook notification', async () => {
      jest
        .spyOn(processWebhookUseCase, 'execute')
        .mockResolvedValue(mockPayment);

      const result = await controller.handleMercadoPagoWebhook({
        id: 'notification_123',
        type: 'payment',
        data: { id: 'external_123' },
      });

      expect(result).toEqual({ received: true });
      expect(processWebhookUseCase.execute).toHaveBeenCalled();
    });
  });
});
