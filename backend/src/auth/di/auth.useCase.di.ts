import type {
  AuthTokenPairDTO,
  CreateUserRequestDTO,
  RegisterUserResponseDTO,
  UserAuthInfo,
  UserForLoginAttemptValidation,
} from 'src/types';

export abstract class DI_AuthUseCase {
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

  abstract logoutAllSessions(userId: number): Promise<void>;

  abstract logoutSessionOf(userId: number, sessionUUID: string): Promise<void>;
}
