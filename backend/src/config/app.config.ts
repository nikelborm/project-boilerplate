import { ConfigKeys, IAppConfigMap } from 'src/types';

// TODO: config types validation
export const appConfig: () => IAppConfigMap = () => ({
  [ConfigKeys.IS_DEVELOPMENT]: process.env.PROJECT_ENV_TYPE === 'development',
  [ConfigKeys.IS_PRODUCTION]:
    (console.log(process.env.PROJECT_ENV_TYPE),
    process.env.PROJECT_ENV_TYPE === 'production'),
  [ConfigKeys.SERVER_PORT]: parseInt(process.env.SERVER_PORT || '3000', 10),
  [ConfigKeys.WEB_SOCKET_SERVER_PORT]: parseInt(
    process.env.WEB_SOCKET_SERVER_PORT || '2999',
    10,
  ),
  [ConfigKeys.BOOTSTRAP_MODE]: process.env.BOOTSTRAP_MODE as
    | 'mock'
    | 'endpoints'
    | 'mockAndEndpoints',
  [ConfigKeys.MOCK_SCRIPT_NAME]: process.env.MOCK_SCRIPT_NAME as string,
  [ConfigKeys.JWT_SECRET]: process.env.JWT_SECRET as string,
  [ConfigKeys.USER_PASSWORD_HASH_SALT]: process.env
    .USER_PASSWORD_HASH_SALT as string,
});
