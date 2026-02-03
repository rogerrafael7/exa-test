import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from './infra/modules/payment.module';
import { PaymentEntity } from './infra/database/entities/payment.entity';
import { env } from './config/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DATABASE_HOST,
      port: parseInt(env.DATABASE_PORT, 10),
      username: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
      entities: [PaymentEntity],
      synchronize: env.NODE_ENV === 'development',
    }),
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
