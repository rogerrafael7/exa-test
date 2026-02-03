import { Test, TestingModule } from '@nestjs/testing';
import { CreatePaymentUseCase } from '../src/application/usecases/create-payment.usecase';
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
  MercadoPagoPreference,
} from '../src/domain/types/payment.types';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  let paymentRepository: jest.Mocked<IPaymentRepository>;
  let paymentGateway: jest.Mocked<IPaymentGateway>;

  const mockPayment: Payment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    cpf: '12345678901',
    description: 'Test payment',
    amount: 100.0,
    paymentMethod: PaymentMethod.PIX,
    status: PaymentStatus.PENDING,
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
        CreatePaymentUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: mockPaymentRepository },
        { provide: PAYMENT_GATEWAY, useValue: mockPaymentGateway },
      ],
    }).compile();

    useCase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
    paymentRepository = module.get(PAYMENT_REPOSITORY);
    paymentGateway = module.get(PAYMENT_GATEWAY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('PIX payment', () => {
    it('should create a PIX payment with PENDING status', async () => {
      paymentRepository.create.mockResolvedValue(mockPayment);

      const result = await useCase.execute({
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
      });

      expect(result).toEqual(mockPayment);
      expect(paymentRepository.create).toHaveBeenCalledWith({
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
      });
      expect(paymentGateway.createPreference).not.toHaveBeenCalled();
    });
  });

  describe('CREDIT_CARD payment', () => {
    it('should create a CREDIT_CARD payment and integrate with Mercado Pago', async () => {
      const creditCardPayment: Payment = {
        ...mockPayment,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      const preference: MercadoPagoPreference = {
        id: 'preference_123',
        initPoint: 'https://mercadopago.com/init_point',
        sandboxInitPoint: 'https://sandbox.mercadopago.com/init_point',
      };

      paymentRepository.create.mockResolvedValue(creditCardPayment);
      paymentGateway.createPreference.mockResolvedValue(preference);
      paymentRepository.update.mockResolvedValue({
        ...creditCardPayment,
        externalId: preference.id,
      });

      const result = await useCase.execute({
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      });

      expect(paymentGateway.createPreference).toHaveBeenCalledWith(
        creditCardPayment,
      );
      expect(paymentRepository.update).toHaveBeenCalledWith({
        id: creditCardPayment.id,
        externalId: preference.id,
      });
      expect(result.externalId).toBe(preference.id);
    });
  });
});
