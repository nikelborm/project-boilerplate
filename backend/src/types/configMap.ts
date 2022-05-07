import { LoggerOptions } from 'typeorm';
import { ConfigKeys } from './configKeys';

export interface IAppConfigMap {
  [ConfigKeys.IS_DEVELOPMENT]: boolean;
  [ConfigKeys.IS_PRODUCTION]: boolean;
  [ConfigKeys.SERVER_PORT]: number;
  [ConfigKeys.WEB_SOCKET_SERVER_PORT]: number;
  [ConfigKeys.BOOTSTRAP_MODE]: 'mock' | 'endpoints' | 'mockAndEndpoints';
  [ConfigKeys.MOCK_SCRIPT_NAME]: string;
}

export interface IDatabaseConfigMap {
  [ConfigKeys.DATABASE_TYPE]: 'postgres';
  [ConfigKeys.DATABASE_HOST]: string;
  [ConfigKeys.DATABASE_PORT]: number;
  [ConfigKeys.DATABASE_USERNAME]: string;
  [ConfigKeys.DATABASE_PASSWORD]: string;
  [ConfigKeys.DATABASE_NAME]: string;
  [ConfigKeys.DATABASE_MIGRATIONS_TABLE_NAME]?: string;
  [ConfigKeys.DATABASE_ENTITIES]?: string[];
  [ConfigKeys.DATABASE_TYPEORM_LOGGING_MODE]: LoggerOptions;
}

export type IAllConfig = IAppConfigMap & IDatabaseConfigMap;
