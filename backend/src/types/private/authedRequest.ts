import type { Request } from 'express';
import type { UserAuthInfo } from '../shared/';

export interface AuthedRequest extends Request {
  user: UserAuthInfo;
  sessionUUID: string;
}
