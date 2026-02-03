import { Test, TestingModule } from '@nestjs/testing';
import { ProcessWebhookUseCase } from '../src/application/usecases';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../src/domain/interfaces/payment-repository.interface';
import {
  IPaymentGateway,
  PAYMENT_GATEWAY,
} from '../src/domain/interfaces/payment-gateway.interface';
import { PaymentMethod, PaymentStatus } from '../src/domain/enums/payment.enum';
import {
  Payment,
  MercadoPagoNotification,
} from '../src/domain/types/payment.types';

describe('ProcessWebhookUseCase', () => {
  let useCase: ProcessWebhookUseCase;
  let paymentRepository: jest.Mocked<IPaymentRepository>;
  let paymentGateway: jest.Mocked<IPaymentGateway>;

  const mockPayment: Payment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    cpf: '12345678901',
    description: 'Test payment',
    amount: 100.0,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.PENDING,
    externalId: 'external_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPaymentRepository: jest.Mocked<IPaymentRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      findByExternalId: jest.fn(),
    };

    const mockPaymentGateway: jest.Mocked<IPaymentGateway> = {
      createPreference: jest.fn(),
      getPaymentStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessWebhookUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: mockPaymentRepository },
        { provide: PAYMENT_GATEWAY, useValue: mockPaymentGateway },
      ],
    }).compile();

    useCase = module.get<ProcessWebhookUseCase>(ProcessWebhookUseCase);
    paymentRepository = module.get(PAYMENT_REPOSITORY);
    paymentGateway = module.get(PAYMENT_GATEWAY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return null for non-payment notifications', async () => {
    const notification: MercadoPagoNotification = {
      id: 'notification_123',
      type: 'merchant_order',
      data: { id: 'order_123' },
    };

    const result = await useCase.execute(notification);

    expect(result).toBeNull();
    expect(paymentRepository.findByExternalId).not.toHaveBeenCalled();
  });

  it('should update payment status to PAID when approved', async () => {
    const notification: MercadoPagoNotification = {
      id: 'notification_123',
      type: 'payment',
      data: { id: 'external_123' },
    };

    const updatedPayment = { ...mockPayment, status: PaymentStatus.PAID };

    paymentRepository.findByExternalId.mockResolvedValue(mockPayment);
    paymentGateway.getPaymentStatus.mockResolvedValue('approved');
    paymentRepository.update.mockResolvedValue(updatedPayment);

    const result = await useCase.execute(notification);

    expect(result?.status).toBe(PaymentStatus.PAID);
    expect(paymentRepository.update).toHaveBeenCalledWith({
      id: mockPayment.id,
      status: PaymentStatus.PAID,
    });
  });

  it('should update payment status to FAIL when rejected', async () => {
    const notification: MercadoPagoNotification = {
      id: 'notification_123',
      type: 'payment',
      data: { id: 'external_123' },
    };

    const updatedPayment = { ...mockPayment, status: PaymentStatus.FAIL };

    paymentRepository.findByExternalId.mockResolvedValue(mockPayment);
    paymentGateway.getPaymentStatus.mockResolvedValue('rejected');
    paymentRepository.update.mockResolvedValue(updatedPayment);

    const result = await useCase.execute(notification);

    expect(result?.status).toBe(PaymentStatus.FAIL);
    expect(paymentRepository.update).toHaveBeenCalledWith({
      id: mockPayment.id,
      status: PaymentStatus.FAIL,
    });
  });

  it('should return null when payment is not found', async () => {
    const notification: MercadoPagoNotification = {
      id: 'notification_123',
      type: 'payment',
      data: { id: 'unknown_external_id' },
    };

    paymentRepository.findByExternalId.mockResolvedValue(null);

    const result = await useCase.execute(notification);

    expect(result).toBeNull();
  });
});
