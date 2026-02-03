import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdatePaymentUseCase } from '../src/application/usecases';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../src/domain/interfaces/payment-repository.interface';
import { PaymentMethod, PaymentStatus } from '../src/domain/enums/payment.enum';
import { Payment } from '../src/domain/types/payment.types';

describe('UpdatePaymentUseCase', () => {
  let useCase: UpdatePaymentUseCase;
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
        UpdatePaymentUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: mockPaymentRepository },
      ],
    }).compile();

    useCase = module.get<UpdatePaymentUseCase>(UpdatePaymentUseCase);
    paymentRepository = module.get(PAYMENT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update payment status successfully', async () => {
    const updatedPayment = { ...mockPayment, status: PaymentStatus.PAID };
    paymentRepository.findById.mockResolvedValue(mockPayment);
    paymentRepository.update.mockResolvedValue(updatedPayment);

    const result = await useCase.execute({
      id: mockPayment.id,
      status: PaymentStatus.PAID,
    });

    expect(result.status).toBe(PaymentStatus.PAID);
    expect(paymentRepository.findById).toHaveBeenCalledWith(mockPayment.id);
    expect(paymentRepository.update).toHaveBeenCalledWith({
      id: mockPayment.id,
      status: PaymentStatus.PAID,
    });
  });

  it('should throw NotFoundException when payment does not exist', async () => {
    paymentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'non-existent-id',
        status: PaymentStatus.PAID,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
