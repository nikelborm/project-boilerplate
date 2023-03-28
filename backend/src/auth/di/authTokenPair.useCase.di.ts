import type {
  AuthTokenPairDTO,
  CreateUserRequestDTO,
  RegisterUserResponseDTO,
  UserAccessTokenPayload,
  UserAuthInfo,
  UserForLoginAttemptValidation,
  UserRefreshTokenPayload,
} from 'src/types';

export abstract class DI_AuthTokenPairUseCase {
  abstract validateLoginAttempt(
    userModel: UserForLoginAttemptValidation,
    password: string,
  ): Promise<void>;

  abstract registerNewUserAndLogin(
    createUserDTO: CreateUserRequestDTO,
  ): Promise<RegisterUserResponseDTO>;

  abstract login(user: UserAuthInfo): Promise<AuthTokenPairDTO>;

  abstract useRefreshTokenAndGetNewTokenPair(
    refreshToken: string,
  ): Promise<AuthTokenPairDTO>;

  abstract finishAllSessionsOfAnyUser(userId: number): Promise<void>;

  abstract finishAllSessionsOfLoggedInUser(refreshToken: string): Promise<void>;

  abstract finishSessionOfAnyUser(
    userId: number,
    sessionUUID: string,
  ): Promise<void>;

  abstract finishSessionOfLoggedInUser(refreshToken: string): Promise<void>;

  abstract decodeAuthHeaderWithAccessTokenAndGetPayload(
    authHeader: string | undefined,
  ): Promise<UserAccessTokenPayload>;

  abstract getAllSessionsOfAnyUser(userId: number): Promise<void>;
  abstract resetAllAccessTokensOfAnyUser(userId: number): Promise<void>;

  abstract decodeAccessTokenAndGetPayload(
    accessToken: string,
  ): Promise<UserAccessTokenPayload>;

  abstract decodeRefreshTokenAndGetPayload(
    refreshToken: string,
  ): Promise<UserRefreshTokenPayload>;
}
