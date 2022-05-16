import { UserAuthInfo } from '.';
import { Request } from 'express';

export interface AuthedRequest extends Request {
  user: UserAuthInfo;
  sessionUUID: string;
}
