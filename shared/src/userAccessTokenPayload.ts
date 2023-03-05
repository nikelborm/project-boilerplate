import type { UniversalTokenPart } from './universalTokenPart';
import type { UserAuthInfo } from './userAuthInfo';

export interface UserAccessTokenPayload extends UniversalTokenPart {
  user: UserAuthInfo;
}
