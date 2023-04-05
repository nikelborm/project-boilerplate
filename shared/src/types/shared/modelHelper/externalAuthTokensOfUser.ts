export enum ExternalTokenProvider {
  GOOGLE = 'google',
}

export interface ExternalAuthTokenOfUser {
  tokenProvider: ExternalTokenProvider;
  token: string;
}

export type ExternalAuthTokensOfUser = ExternalAuthTokenOfUser[];
