import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPaymentUseCase } from '../src/application/usecases';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../src/domain/interfaces/payment-repository.interface';
import { PaymentMethod, PaymentStatus } from '../src/domain/enums/payment.enum';
import { Payment } from '../src/domain/types/payment.types';

describe('GetPaymentUseCase', () => {
  let useCase: GetPaymentUseCase;
  let paymentRepository: jest.Mocked<IPaymentRepository>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPaymentUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: mockPaymentRepository },
      ],
    }).compile();

    useCase = module.get<GetPaymentUseCase>(GetPaymentUseCase);
    paymentRepository = module.get(PAYMENT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a payment when found', async () => {
    paymentRepository.findById.mockResolvedValue(mockPayment);

    const result = await useCase.execute(mockPayment.id);

    expect(result).toEqual(mockPayment);
    expect(paymentRepository.findById).toHaveBeenCalledWith(mockPayment.id);
  });

  it('should throw NotFoundException when payment does not exist', async () => {
    paymentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
