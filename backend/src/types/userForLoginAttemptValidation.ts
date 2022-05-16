import type { UserAuthInfo } from './userAuthInfo';

export interface UserForLoginAttemptValidation extends UserAuthInfo {
  salt: string;
  passwordHash: string;
}
