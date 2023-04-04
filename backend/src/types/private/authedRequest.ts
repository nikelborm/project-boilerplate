import type { Request } from 'express';
import type { RefreshTokenPayloadDTO, AccessTokenPayloadDTO } from '../shared/';

export interface AuthorizedRequest
  extends Omit<Request, 'user'>,
    AccessTokenPayloadDTO {}

export interface RequestWithValidRefreshToken
  extends Omit<Request, 'user'>,
    RefreshTokenPayloadDTO {}
