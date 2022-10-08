import type { MockDataUseCase } from 'src/mock';
import { BootstrapModeType, ConfigKeys, IAppConfigMap } from 'src/types';

// TODO: config types validation
export const appConfig: () => IAppConfigMap = () => ({
  [ConfigKeys.IS_DEVELOPMENT]: process.env.NODE_ENV === 'development',
  [ConfigKeys.IS_PRODUCTION]: process.env.NODE_ENV === 'production',
  [ConfigKeys.SERVER_PORT]: parseInt(process.env.SERVER_PORT || '3000', 10),
  [ConfigKeys.WEB_SOCKET_SERVER_PORT]: parseInt(
    process.env.WEB_SOCKET_SERVER_PORT || '2999',
    10,
  ),
  [ConfigKeys.BOOTSTRAP_MODE]: process.env.BOOTSTRAP_MODE as BootstrapModeType,
  [ConfigKeys.MOCK_SCRIPT_NAME]: process.env.MOCK_SCRIPT_NAME as Exclude<
    keyof MockDataUseCase,
    'executeMock'
  >,
  [ConfigKeys.JWT_SECRET]: process.env.JWT_SECRET as string,
  [ConfigKeys.USER_PASSWORD_HASH_SALT]: process.env
    .USER_PASSWORD_HASH_SALT as string,
  [ConfigKeys.INVITE_USERS_SIGN_KEY]: process.env
    .INVITE_USERS_SIGN_KEY as string,
});
