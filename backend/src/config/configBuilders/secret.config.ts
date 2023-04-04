import type { GoogleOAuthTokenSecretWrapperDTO } from 'src/types';
import type { ISecretConfigMap } from '../types';
import { ConfigKeys } from '../types';

export const secretConfig: () => ISecretConfigMap = () => ({
  [ConfigKeys.AUTH_JWT_SECRET]: process.env['AUTH_JWT_SECRET'] as string,
  [ConfigKeys.USER_PASSWORD_HASH_SALT_SECRET]: process.env[
    'USER_PASSWORD_HASH_SALT'
  ] as string,
  [ConfigKeys.INVITE_USERS_SIGN_KEY_SECRET]: process.env[
    'INVITE_USERS_SIGN_KEY'
  ] as string,
  [ConfigKeys.COOKIE_SIGN_KEY_SECRET]: process.env['COOKIE_SIGN_KEY'] as string,
  [ConfigKeys.GOOGLE_OAUTH_TOKEN_SECRET]: JSON.parse(
    process.env['GOOGLE_OAUTH_TOKEN_SECRET'] as string,
  ) as GoogleOAuthTokenSecretWrapperDTO,
});
