import { dataSourceConfig } from '../databaseConnectionOptions';
import { ConfigKeys, type IDatabaseConfigMap } from '../types';

export const dbConfig: () => IDatabaseConfigMap = () => ({
  [ConfigKeys.DATABASE_HOST]: dataSourceConfig.host,
  [ConfigKeys.DATABASE_PORT]: dataSourceConfig.port,
  [ConfigKeys.DATABASE_USERNAME]: dataSourceConfig.username,
  [ConfigKeys.DATABASE_PASSWORD]: dataSourceConfig.password,
  [ConfigKeys.DATABASE_NAME]: dataSourceConfig.database,
  [ConfigKeys.DATABASE_TYPEORM_LOGGING_MODE]: dataSourceConfig.logging,
});
