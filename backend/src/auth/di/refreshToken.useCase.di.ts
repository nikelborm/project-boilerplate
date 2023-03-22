import type { UserAuthInfo, UserRefreshTokenPayload } from 'src/types';

export abstract class DI_RefreshTokenUseCase {
  abstract getRefreshToken(user: UserAuthInfo, sessionUUID: string): string;

  abstract decodeRefreshTokenAndGetPayload(
    refreshToken: string,
  ): Promise<UserRefreshTokenPayload>;
}
