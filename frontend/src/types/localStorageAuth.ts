export type ISession =
  | { isAuthed: false }
  | {
      isAuthed: true;
      accessToken: {
        text: string;
        payload: IAccessTokenPayload;
      };
      refreshToken: {
        text: string;
        payload: IRefreshTokenPayload;
      };
    };

export type IAccessTokenPayload = {
  sessionUUID: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export type IRefreshTokenPayload = {
  sessionUUID: string;
  user: {
    id: number;
  };
};

export type ITokenPair = { accessToken: string; refreshToken: string };
