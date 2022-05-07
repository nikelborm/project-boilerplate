import { ConfigKeys } from 'src/types/configKeys';
import type { IAppConfigMap } from 'src/types/configMap';

// TODO: config types validation
export const appConfig: () => IAppConfigMap = () => ({
  [ConfigKeys.IS_DEVELOPMENT]: process.env.PROJECT_ENV_TYPE === 'development',
  [ConfigKeys.IS_PRODUCTION]: process.env.PROJECT_ENV_TYPE === 'production',
  [ConfigKeys.SERVER_PORT]: parseInt(process.env.SERVER_PORT || '3000', 10),
  [ConfigKeys.WEB_SOCKET_SERVER_PORT]: 4999,
  [ConfigKeys.BOOTSTRAP_MODE]: process.env.BOOTSTRAP_MODE as
    | 'mock'
    | 'endpoints'
    | 'mockAndEndpoints',
  [ConfigKeys.MOCK_SCRIPT_NAME]: process.env.MOCK_SCRIPT_NAME as string,
});
