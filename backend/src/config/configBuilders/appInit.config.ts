import type { MockDataUseCase } from 'src/mock';
import {
  ConfigKeys,
  type BootstrapMode,
  type IAppInitConfigMap,
} from '../types';

export const appInitConfig: () => IAppInitConfigMap = () => ({
  [ConfigKeys.IS_DEVELOPMENT]: process.env['NODE_ENV'] === 'development',
  [ConfigKeys.TOKEN_PAIR_COOKIE_CONFIG]:
    process.env['NODE_ENV'] === 'development'
      ? {
          signed: true,
          sameSite: 'strict',
        }
      : {
          signed: true,
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        },
  [ConfigKeys.IS_PRODUCTION]: process.env['NODE_ENV'] === 'production',
  [ConfigKeys.IS_SERVICE_HELPER_ONLY_MODE]:
    process.env['IS_SERVICE_HELPER_ONLY_MODE'] === 'true',
  [ConfigKeys.ENABLE_SWAGGER_IN_PROD]:
    process.env['ENABLE_SWAGGER_IN_PROD'] === 'true',
  [ConfigKeys.BOOTSTRAP_MODE]: process.env['BOOTSTRAP_MODE'] as BootstrapMode,
  [ConfigKeys.MOCK_SCRIPT_NAME]: process.env['MOCK_SCRIPT_NAME'] as Exclude<
    keyof MockDataUseCase,
    'executeMock'
  >,
  [ConfigKeys.SERVER_PORT]: parseInt(process.env['SERVER_PORT'] || '3000', 10),
  [ConfigKeys.WEB_SOCKET_SERVER_PORT]: parseInt(
    process.env['WEB_SOCKET_SERVER_PORT'] || '2999',
    10,
  ),
  [ConfigKeys.WEB_SOCKET_SERVER_PATH]:
    process.env['WEB_SOCKET_SERVER_PATH'] || '/api/ws',
});
