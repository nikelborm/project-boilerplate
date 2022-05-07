import { LoggerOptions } from 'typeorm';

export const dataSourceConfig = {
  type: 'postgres',
  host: process.env.DATABASE_HOST as string,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME as string,
  password: process.env.DATABASE_PASSWORD as string,
  database: process.env.DATABASE_NAME as string,
  logging: JSON.parse(
    process.env.DATABASE_TYPEORM_LOGGING_MODE || 'all',
  ) as LoggerOptions,
  entities: ['dist/modules/infrastructure/model/*.model.js'],
  migrations: ['dist/modules/infrastructure/migration/*.js'],
};
