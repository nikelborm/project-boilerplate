import { LoggerOptions } from 'typeorm';
import { ConfigKeys } from './configKeys';

export type IAppConfigMap = {
  [ConfigKeys.BOOTSTRAP_MODE]: 'mock' | 'endpoints' | 'mockAndEndpoints';
  [ConfigKeys.IS_DEVELOPMENT]: boolean;
  [ConfigKeys.IS_PRODUCTION]: boolean;
  [ConfigKeys.MOCK_SCRIPT_NAME]: string;
  [ConfigKeys.JWT_SECRET]: string;
  [ConfigKeys.USER_PASSWORD_HASH_SALT]: string;
  [ConfigKeys.SERVER_PORT]: number;
  [ConfigKeys.WEB_SOCKET_SERVER_PORT]: number;
};

export type IDatabaseConfigMap = {
  [ConfigKeys.DATABASE_HOST]: string;
  [ConfigKeys.DATABASE_NAME]: string;
  [ConfigKeys.DATABASE_PASSWORD]: string;
  [ConfigKeys.DATABASE_PORT]: number;
  [ConfigKeys.DATABASE_TYPEORM_LOGGING_MODE]: LoggerOptions;
  [ConfigKeys.DATABASE_USERNAME]: string;
};
