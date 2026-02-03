import { Test, TestingModule } from '@nestjs/testing';
import { ListPaymentsUseCase } from '../src/application/usecases';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../src/domain/interfaces/payment-repository.interface';
import { PaymentMethod, PaymentStatus } from '../src/domain/enums/payment.enum';
import { Payment } from '../src/domain/types/payment.types';

describe('ListPaymentsUseCase', () => {
  let useCase: ListPaymentsUseCase;
  let paymentRepository: jest.Mocked<IPaymentRepository>;

  const mockPayments: Payment[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      cpf: '12345678901',
      description: 'Test payment 1',
      amount: 100.0,
      paymentMethod: PaymentMethod.PIX,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      cpf: '12345678901',
      description: 'Test payment 2',
      amount: 200.0,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PAID,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const mockPaymentRepository: jest.Mocked<IPaymentRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      findByExternalId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPaymentsUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: mockPaymentRepository },
      ],
    }).compile();

    useCase = module.get<ListPaymentsUseCase>(ListPaymentsUseCase);
    paymentRepository = module.get(PAYMENT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all payments without filters', async () => {
    paymentRepository.findAll.mockResolvedValue(mockPayments);

    const result = await useCase.execute({});

    expect(result).toEqual(mockPayments);
    expect(paymentRepository.findAll).toHaveBeenCalledWith({});
  });

  it('should return payments filtered by CPF', async () => {
    const filteredPayments = [mockPayments[0]];
    paymentRepository.findAll.mockResolvedValue(filteredPayments);

    const result = await useCase.execute({ cpf: '12345678901' });

    expect(result).toEqual(filteredPayments);
    expect(paymentRepository.findAll).toHaveBeenCalledWith({
      cpf: '12345678901',
    });
  });

  it('should return payments filtered by payment method', async () => {
    const filteredPayments = [mockPayments[1]];
    paymentRepository.findAll.mockResolvedValue(filteredPayments);

    const result = await useCase.execute({
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });

    expect(result).toEqual(filteredPayments);
    expect(paymentRepository.findAll).toHaveBeenCalledWith({
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });
  });

  it('should return empty array when no payments match filters', async () => {
    paymentRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute({ cpf: '99999999999' });

    expect(result).toEqual([]);
  });
});
