export interface ExternalAuthTokenOfUser {
  tokenProvider: ExternalTokenProvider;
  token: string;
}

export type ExternalAuthTokensOfUser = ExternalAuthTokenOfUser[];

export enum ExternalTokenProvider {
  GOOGLE = 'google',
}
