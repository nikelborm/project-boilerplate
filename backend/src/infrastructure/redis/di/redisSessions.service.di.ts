export abstract class DI_RedisSessionsService {
  abstract setNewSessionTokenPair(params: {
    userId: number;
    sessionUUID: string;
    accessToken: string;
    refreshToken: string;
  }): Promise<void>;

  abstract updateTokenPair(params: {
    sessionUUID: string;
    accessToken: string;
    refreshToken: string;
  }): Promise<void>;

  abstract finishSession(params: {
    userId: number;
    sessionUUID: string;
  }): Promise<void>;

  abstract finishAllSessions(userId: number): Promise<void>;

  abstract resetAllAccessTokensOf(userId: number): Promise<void>;

  abstract getAllSessionsOf(
    userId: number,
  ): Promise<{ access?: string; refresh: string }[]>;

  abstract hasTokenBeenWhitelisted(params: {
    userId: number;
    sessionUUID: string;
    token: string;
    tokenField: 'access' | 'refresh';
  }): Promise<boolean>;
}
