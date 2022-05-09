import { Request } from 'express';
import type { AccessScopeType } from 'src/types';

export interface UserAuthTokenPayload {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface UserAuthInfo {
  id: number;
  firstName: string;
  lastName: string;
  accessScopes: {
    id: number;
    type: AccessScopeType;
  }[];
}

export interface AuthedRequest extends Request {
  user: UserAuthInfo;
}

export {
  IAccessEnum,
  AccessEnum,
  AllowedFor,
  Public,
  AuthorizedOnly,
  DevelopmentOnly,
} from './decorators';

export { AuthModule } from './auth.module';
