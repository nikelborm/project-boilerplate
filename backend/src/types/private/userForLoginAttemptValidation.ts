import type { AccessTokenUserInfoDTO } from '../shared';

export interface UserForLoginAttemptValidation extends AccessTokenUserInfoDTO {
  salt: string;
  passwordHash: string;
}
