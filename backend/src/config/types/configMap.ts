import type { MockDataUseCase } from 'src/mock';
import type { LoggerOptions } from 'typeorm';
import type { BootstrapMode } from './bootstrapMode';
import type { ConfigKeys } from './configKeys';

export type IAppConfigMap = {
  [ConfigKeys.BOOTSTRAP_MODE]: BootstrapMode;
  [ConfigKeys.IS_DEVELOPMENT]: boolean;
  [ConfigKeys.IS_PRODUCTION]: boolean;
  [ConfigKeys.MOCK_SCRIPT_NAME]: Exclude<keyof MockDataUseCase, 'executeMock'>;
  [ConfigKeys.AUTH_JWT_SECRET]: string;
  [ConfigKeys.USER_PASSWORD_HASH_SALT]: string;
  [ConfigKeys.SERVER_PORT]: number;
  [ConfigKeys.WEB_SOCKET_SERVER_PORT]: number;
  [ConfigKeys.WEB_SOCKET_SERVER_PATH]: string;
  [ConfigKeys.INVITE_USERS_SIGN_KEY]: string;
};

export type IDatabaseConfigMap = {
  [ConfigKeys.DATABASE_HOST]: string;
  [ConfigKeys.DATABASE_NAME]: string;
  [ConfigKeys.DATABASE_PASSWORD]: string;
  [ConfigKeys.DATABASE_PORT]: number;
  [ConfigKeys.DATABASE_TYPEORM_LOGGING_MODE]: LoggerOptions;
  [ConfigKeys.DATABASE_USERNAME]: string;
};

export type IRedisConfigMap = {
  [ConfigKeys.REDIS_MASTER_PORT]: number;
  [ConfigKeys.REDIS_MASTER_HOST]: string;
  [ConfigKeys.REDIS_MASTER_PASSWORD]: string;
  [ConfigKeys.REDIS_REPLICA_PORT]: number;
  [ConfigKeys.REDIS_REPLICA_HOST]: string;
  [ConfigKeys.REDIS_REPLICA_PASSWORD]: string;
};
