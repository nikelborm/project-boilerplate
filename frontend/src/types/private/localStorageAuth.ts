import type { AccessTokenPayloadDTO, RefreshTokenPayloadDTO } from '../shared';

export type ISession =
  | { isAuthed: false }
  | {
      isAuthed: true;
      accessToken: {
        text: string;
        payload: AccessTokenPayloadDTO;
      };
      refreshToken: {
        text: string;
        payload: RefreshTokenPayloadDTO;
      };
    };
