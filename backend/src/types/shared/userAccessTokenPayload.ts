import { UserAuthInfo } from './userAuthInfo';
import { UniversalTokenPart } from './universalTokenPart';

export interface UserAccessTokenPayload extends UniversalTokenPart {
  user: UserAuthInfo;
}
