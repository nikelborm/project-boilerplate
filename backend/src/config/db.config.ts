import { registerAs } from '@nestjs/config';
import { ConfigKeys } from 'src/types/configKeys';
import { IDatabaseConfigMap } from 'src/types/configMap';
import { dataSourceConfig } from './databaseConnectionOptions';

const dbConfigWithDatabasePrefixes: IDatabaseConfigMap = {
  [ConfigKeys.DATABASE_TYPE]: dataSourceConfig.type,
  [ConfigKeys.DATABASE_HOST]: dataSourceConfig.host,
  [ConfigKeys.DATABASE_PORT]: dataSourceConfig.port,
  [ConfigKeys.DATABASE_USERNAME]: dataSourceConfig.username,
  [ConfigKeys.DATABASE_PASSWORD]: dataSourceConfig.password,
  [ConfigKeys.DATABASE_NAME]: dataSourceConfig.database,
  [ConfigKeys.DATABASE_MIGRATIONS_TABLE_NAME]:
    dataSourceConfig.migrationsTableName,
  [ConfigKeys.DATABASE_ENTITIES]: dataSourceConfig.entities,
  [ConfigKeys.DATABASE_TYPEORM_LOGGING_MODE]: dataSourceConfig.logging,
};

const dbConfigWithoutPrefixes = Object.fromEntries(
  Object.entries(dbConfigWithDatabasePrefixes).map(([key, value]) => [
    key.replace('database.', ''),
    value,
  ]),
);

// TODO: config types validation
export const dbConfig = registerAs('database', () => dbConfigWithoutPrefixes);
