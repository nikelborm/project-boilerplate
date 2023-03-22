import { UserAuthInfo } from 'src/types';

export abstract class DI_AccessTokenUseCase {
  abstract getAccessToken(user: UserAuthInfo, sessionUUID: string): string;

  abstract decodeAuthHeaderAndGetUserId(
    authHeader: string | undefined,
  ): Promise<{ userId: number }>;
}
