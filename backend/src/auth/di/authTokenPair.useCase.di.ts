import type {
  AccessTokenPayloadDTO,
  AccessTokenUserInfoDTO,
  AuthTokenPairDTO,
  CreateUserRequestDTO,
  RefreshTokenPayloadDTO,
  UserForLoginAttemptValidation,
} from 'src/types';

export abstract class DI_AuthTokenPairUseCase {
  abstract validateLoginAttempt(
    userModel: UserForLoginAttemptValidation,
    password: string,
  ): void;

  abstract registerNewUserAndLogin(
    createUserDTO: CreateUserRequestDTO,
  ): Promise<AuthTokenPairDTO>;

  abstract login(user: AccessTokenUserInfoDTO): Promise<AuthTokenPairDTO>;

  abstract useRefreshTokenAndGetNewTokenPair(
    refreshToken: string,
  ): Promise<AuthTokenPairDTO>;

  abstract useRefreshTokenPayloadAndGetNewTokenPair(
    payload: RefreshTokenPayloadDTO,
  ): Promise<AuthTokenPairDTO>;

  abstract finishAllSessionsOfAnyUser(userId: number): Promise<void>;

  abstract finishAllSessionsOfLoggedInUser(refreshToken: string): Promise<void>;

  abstract finishSessionOfAnyUser(
    userId: number,
    sessionUUID: string,
  ): Promise<void>;

  abstract finishSessionOfLoggedInUser(refreshToken: string): Promise<void>;

  abstract getAllSessionsOfAnyUser(userId: number): Promise<void>;
  abstract resetAllAccessTokensOfAnyUser(userId: number): Promise<void>;

  abstract assertAccessTokenIsValidAndGetPayload(
    accessToken: unknown,
  ): Promise<AccessTokenPayloadDTO>;

  abstract assertRefreshTokenIsValidAndGetPayload(
    refreshToken: unknown,
  ): Promise<RefreshTokenPayloadDTO>;
}
