import { LoggerOptions } from 'typeorm';

export const dataSourceConfig = {
  type: 'postgres' as const,
  host: 'localhost',
  port: 5501,
  username: 'smarthouse_gateway_pgdocker',
  password: 'smarthouse_gateway_pgdocker',
  database: 'smarthouse_gateway_pgdocker',
  synchronize: false,
  migrationsTableName: void 0,
  migrationsRun: void 0,
  logging: 'all' as LoggerOptions,
  entities: ['dist/modules/infrastructure/model/*.model.js'],
  migrations: ['dist/modules/infrastructure/migration/*.js'],
};
