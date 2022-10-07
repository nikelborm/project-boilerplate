import type { UserAuthInfo } from '../shared';
import type { Request } from 'express';

export interface AuthedRequest extends Request {
  user: UserAuthInfo;
  sessionUUID: string;
}
