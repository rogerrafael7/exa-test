import * as dotenv from 'dotenv';

dotenv.config();

type EnvConfig = {
  PORT: string;
  NODE_ENV: string;
  DATABASE_HOST: string;
  DATABASE_PORT: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  MERCADO_PAGO_ACCESS_TOKEN: string;
  MERCADO_PAGO_WEBHOOK_URL: string;
};

const envHandler: ProxyHandler<EnvConfig> = {
  get(_target, prop: string) {
    return process.env[prop];
  },
};

export const env = new Proxy({} as EnvConfig, envHandler);
