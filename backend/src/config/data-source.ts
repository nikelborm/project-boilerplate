import { DataSource } from 'typeorm';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { dataSourceConfig } from './databaseConnectionOptions';

const dataSourceConfigTyped: PostgresConnectionOptions = dataSourceConfig;

export const AppDataSource = new DataSource(dataSourceConfigTyped);
