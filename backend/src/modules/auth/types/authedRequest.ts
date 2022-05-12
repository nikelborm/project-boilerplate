import { UserAuthInfo } from './userAuthInfo';
import { Request } from 'express';

export interface AuthedRequest extends Request {
  user: UserAuthInfo;
}
