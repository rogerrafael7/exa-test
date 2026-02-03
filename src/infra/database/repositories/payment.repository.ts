import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPaymentRepository } from '../../../domain/interfaces/payment-repository.interface';
import {
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
  PaymentFilter,
} from '../../../domain/types/payment.types';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentStatus } from '../../../domain/enums/payment.enum';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repository: Repository<PaymentEntity>,
  ) {}

  async create(data: CreatePaymentInput): Promise<Payment> {
    const entity = this.repository.create({
      ...data,
      status: PaymentStatus.PENDING,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Payment | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(filter: PaymentFilter): Promise<Payment[]> {
    const queryBuilder = this.repository.createQueryBuilder('payment');

    if (filter.cpf) {
      queryBuilder.andWhere('payment.cpf = :cpf', { cpf: filter.cpf });
    }

    if (filter.paymentMethod) {
      queryBuilder.andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod: filter.paymentMethod,
      });
    }

    if (filter.status) {
      queryBuilder.andWhere('payment.status = :status', {
        status: filter.status,
      });
    }

    queryBuilder.orderBy('payment.createdAt', 'DESC');

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async update(data: UpdatePaymentInput): Promise<Payment> {
    await this.repository.update(data.id, {
      ...(data.status && { status: data.status }),
      ...(data.description && { description: data.description }),
      ...(data.externalId && { externalId: data.externalId }),
    });

    const updated = await this.repository.findOne({ where: { id: data.id } });
    return this.toDomain(updated!);
  }

  async findByExternalId(externalId: string): Promise<Payment | null> {
    const entity = await this.repository.findOne({ where: { externalId } });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: PaymentEntity): Payment {
    return {
      id: entity.id,
      cpf: entity.cpf,
      description: entity.description,
      amount: Number(entity.amount),
      paymentMethod: entity.paymentMethod,
      status: entity.status,
      externalId: entity.externalId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
