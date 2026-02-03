# Payment API

API REST para gerenciamento de cobranças de um sistema financeiro, com integração para processamento de pagamentos via PIX e Cartão de Crédito (Mercado Pago).

## Arquitetura

O projeto utiliza **Arquitetura Hexagonal** (Ports and Adapters) com a seguinte estrutura:

```
src/
├── config/                     # Configurações (env.ts)
├── domain/                     # Camada de Domínio
│   ├── dtos/                   # Data Transfer Objects
│   ├── enums/                  # Enumerações
│   ├── interfaces/             # Contratos/Portas
│   ├── mappers/                # Mapeadores de entidades
│   └── types/                  # Tipos TypeScript
├── application/                # Camada de Aplicação
│   ├── controllers/            # Controladores HTTP
│   ├── filters/                # Filtros de exceção
│   └── usecases/               # Casos de uso
└── infra/                      # Camada de Infraestrutura
    ├── database/
    │   ├── entities/           # Entidades TypeORM
    │   └── repositories/       # Implementação dos repositórios
    ├── modules/                # Módulos NestJS
    └── services/               # Serviços externos (Mercado Pago)
```

## Tecnologias

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **Jest** - Testes unitários
- **class-validator** - Validação de DTOs
- **Axios** - Cliente HTTP para integração com Mercado Pago

## Instalação

```bash
npm install
```

## Configuração

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

### Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta da aplicação (default: 3000) |
| `NODE_ENV` | Ambiente (development/production) |
| `DATABASE_HOST` | Host do PostgreSQL |
| `DATABASE_PORT` | Porta do PostgreSQL |
| `DATABASE_USER` | Usuário do PostgreSQL |
| `DATABASE_PASSWORD` | Senha do PostgreSQL |
| `DATABASE_NAME` | Nome do banco de dados |
| `MERCADO_PAGO_ACCESS_TOKEN` | Token de acesso do Mercado Pago |
| `MERCADO_PAGO_WEBHOOK_URL` | URL para receber webhooks |

## Executando

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:cov
```

## Endpoints

### Criar Pagamento
```http
POST /api/payment
Content-Type: application/json

{
  "cpf": "12345678901",
  "description": "Descrição da cobrança",
  "amount": 100.00,
  "paymentMethod": "PIX"
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "cpf": "12345678901",
  "description": "Descrição da cobrança",
  "amount": 100.00,
  "paymentMethod": "PIX",
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Atualizar Pagamento
```http
PUT /api/payment/{id}
Content-Type: application/json

{
  "status": "PAID"
}
```

### Buscar Pagamento por ID
```http
GET /api/payment/{id}
```

### Listar Pagamentos
```http
GET /api/payment?cpf=12345678901&paymentMethod=PIX&status=PENDING
```

### Webhook Mercado Pago
```http
POST /api/payment/webhook/mercadopago
Content-Type: application/json

{
  "id": "notification_id",
  "type": "payment",
  "data": {
    "id": "payment_id"
  }
}
```

## Modelo de Dados

### Payment

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `cpf` | string(11) | CPF do cliente |
| `description` | string | Descrição da cobrança |
| `amount` | decimal | Valor da transação |
| `paymentMethod` | enum | PIX ou CREDIT_CARD |
| `status` | enum | PENDING, PAID ou FAIL |
| `externalId` | string | ID externo (Mercado Pago) |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

## Regras de Negócio

### PIX
- Cria o registro do pagamento com status `PENDING`
- Não requer integração externa

### Cartão de Crédito
- Integra com a API de Preferências do Checkout do Mercado Pago
- Recebe webhook para atualização do status
- Status é atualizado para `PAID` ou `FAIL` conforme retorno do Mercado Pago

## Validações

- **CPF**: Deve conter exatamente 11 dígitos numéricos
- **Amount**: Deve ser maior que 0
- **PaymentMethod**: Deve ser `PIX` ou `CREDIT_CARD`
- **Status**: Deve ser `PENDING`, `PAID` ou `FAIL`
