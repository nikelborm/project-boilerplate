import { Injectable, Provider, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'crypto';
import { TokenExpiredError } from 'jsonwebtoken';
import {
  ConfigKeys,
  DI_TypedConfigService,
  IAppConfigMap,
  messages,
} from 'src/config';
import { DI_RedisSessionsService } from 'src/infrastructure';
import {
  AuthTokenPairDTO,
  CreateUserRequestDTO,
  RegisterUserResponseDTO,
  UserAccessTokenPayload,
  UserAuthInfo,
  UserForLoginAttemptValidation,
  UserRefreshTokenPayload,
} from 'src/types';
import { UniversalTokenPart } from 'src/types/shared/universalTokenPart';
import { DI_UserUseCase } from 'src/user';
import { v4 as uuid } from 'uuid';
import { DI_AuthTokenPairUseCase } from './di';

@Injectable()
class AuthTokenPairUseCase implements DI_AuthTokenPairUseCase {
  private readonly AUTH_JWT_SECRET: string;
  private readonly USER_PASSWORD_HASH_SALT: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userUseCase: DI_UserUseCase,
    private readonly redisSessionsService: DI_RedisSessionsService,
    configService: DI_TypedConfigService<IAppConfigMap>,
  ) {
    this.AUTH_JWT_SECRET = configService.get(ConfigKeys.AUTH_JWT_SECRET);
    this.USER_PASSWORD_HASH_SALT = configService.get(
      ConfigKeys.USER_PASSWORD_HASH_SALT,
    );
  }

  async useRefreshTokenAndGetNewTokenPair(
    refreshTokenToBeRemoved: string,
  ): Promise<AuthTokenPairDTO> {
    const {
      sessionUUID,
      user: { id: userId },
    } = await this.decodeRefreshTokenAndGetPayload(refreshTokenToBeRemoved);

    const user = await this.userUseCase.getOneByIdWithAccessScopes(userId);

    const tokenPair = this.createNewTokenPair({
      user,
      sessionUUID,
    });

    await this.redisSessionsService.updateTokenPair({
      sessionUUID,
      ...tokenPair,
    });

    return tokenPair;
  }

  async finishAllSessionsOfAnyUser(userId: number): Promise<void> {
    await this.redisSessionsService.finishAllSessions(userId);
  }

  async finishAllSessionsOfLoggedInUser(refreshToken: string): Promise<void> {
    const { user } = await this.decodeRefreshTokenAndGetPayload(refreshToken);
    await this.redisSessionsService.finishAllSessions(user.id);
  }

  async finishSessionOfAnyUser(
    userId: number,
    sessionUUID: string,
  ): Promise<void> {
    await this.redisSessionsService.finishSession({ userId, sessionUUID });
  }

  async finishSessionOfLoggedInUser(refreshToken: string): Promise<void> {
    const { user, sessionUUID } = await this.decodeRefreshTokenAndGetPayload(
      refreshToken,
    );
    await this.redisSessionsService.finishSession({
      userId: user.id,
      sessionUUID,
    });
  }

  async getAllSessionsOfAnyUser(userId: number): Promise<void> {
    await this.redisSessionsService.getAllSessionsOf(userId);
    // TODO: parse returned token pair to get useful info like device country etc
  }

  async resetAllAccessTokensOfAnyUser(userId: number): Promise<void> {
    await this.redisSessionsService.resetAllAccessTokensOf(userId);
  }

  async validateLoginAttempt(
    userModel: UserForLoginAttemptValidation,
    password: string,
  ): Promise<void> {
    const { passwordHash, salt } = userModel;

    const isPasswordCorrect = timingSafeEqual(
      Buffer.from(passwordHash, 'hex'),
      createHash('sha256')
        .update(salt)
        .update(password)
        .update(this.USER_PASSWORD_HASH_SALT)
        .digest(),
    );

    if (!isPasswordCorrect)
      throw new UnauthorizedException(messages.auth.incorrectPassword);

    // if (!userModel.accessScopes.length)
    //   throw new UnauthorizedException(messages.auth.userHasNoAccessScopes);
  }

  async registerNewUserAndLogin(
    createUserDTO: CreateUserRequestDTO,
  ): Promise<RegisterUserResponseDTO> {
    const user = await this.userUseCase.createUser(createUserDTO);
    return {
      authTokenPair: await this.login({
        ...user,
        accessScopes: [],
      }),
    };
  }

  async login(user: UserAuthInfo): Promise<AuthTokenPairDTO> {
    const sessionUUID = uuid();

    const tokenPair = this.createNewTokenPair({
      user,
      sessionUUID,
    });

    await this.redisSessionsService.setNewSessionTokenPair({
      ...tokenPair,
      userId: user.id,
      sessionUUID,
    });
    return tokenPair;
  }

  async decodeAuthHeaderWithAccessTokenAndGetUserId(
    authHeader: string | undefined,
  ): Promise<{ userId: number }> {
    if (!authHeader)
      throw new UnauthorizedException(messages.auth.missingAuthHeader);

    const [type, accessToken] = authHeader.split(' ');

    if (type !== 'Bearer')
      throw new UnauthorizedException(messages.auth.incorrectTokenType);

    if (!accessToken)
      throw new UnauthorizedException(messages.auth.missingToken);

    const { user } = await this.decodeAccessTokenAndGetPayload(accessToken);
    return { userId: user.id };
  }

  async decodeAccessTokenAndGetPayload(
    accessToken: string,
  ): Promise<UserAccessTokenPayload> {
    return await this.decodeTokenAndGetPayload<UserAccessTokenPayload>(
      accessToken,
      'access',
      messages.auth.accessTokenExpired,
      messages.auth.invalidAccessToken,
      messages.auth.yourSessionWasFinished,
    );
  }

  async decodeRefreshTokenAndGetPayload(
    refreshToken: string,
  ): Promise<UserRefreshTokenPayload> {
    return await this.decodeTokenAndGetPayload<UserRefreshTokenPayload>(
      refreshToken,
      'refresh',
      messages.auth.yourSessionWasFinished,
      messages.auth.invalidRefreshToken,
      messages.auth.yourSessionWasFinished,
    );
  }

  private async decodeTokenAndGetPayload<
    TokenPayload extends UniversalTokenPart,
  >(
    token: string,
    tokenField: 'access' | 'refresh',
    tokenExpiredMessage: string,
    tokenInvalidMessage: string,
    tokenBlacklistedMessage: string,
  ): Promise<TokenPayload> {
    try {
      this.jwtService.verify(token, {
        secret: this.AUTH_JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new UnauthorizedException(tokenExpiredMessage);
      throw new UnauthorizedException(tokenInvalidMessage);
    }

    const tokenPayload = this.jwtService.decode(token) as TokenPayload;

    if (
      !(await this.redisSessionsService.hasTokenBeenWhitelisted({
        userId: tokenPayload.user.id,
        sessionUUID: tokenPayload.sessionUUID,
        token,
        tokenField,
      }))
    )
      throw new UnauthorizedException(tokenBlacklistedMessage);

    return tokenPayload;
  }

  private createNewTokenPair({
    sessionUUID,
    user,
  }: UserAccessTokenPayload): AuthTokenPairDTO {
    return {
      accessToken: this.createNewAccessToken({
        sessionUUID,
        user,
      }),
      refreshToken: this.createNewRefreshToken({
        sessionUUID,
        user,
      }),
    };
  }

  private createNewAccessToken(payload: UserAccessTokenPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '20m',
    });
  }

  private createNewRefreshToken({
    user,
    sessionUUID,
  }: UserRefreshTokenPayload): string {
    return this.jwtService.sign(
      {
        user: {
          id: user.id,
        },
        sessionUUID,
      },
      { expiresIn: '7d' },
    );
  }
}

export const AuthTokenPairUseCaseProvider: Provider = {
  provide: DI_AuthTokenPairUseCase,
  useClass: AuthTokenPairUseCase,
};
