import type { Provider } from '@nestjs/common';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'crypto';
import { TokenExpiredError } from 'jsonwebtoken';
import type { ISecretConfigMap } from 'src/config';
import { ConfigKeys, DI_TypedConfigService, messages } from 'src/config';
import { DI_RedisSessionsService } from 'src/infrastructure';
import { logObjectNicely, validate } from 'src/tools';
import type {
  AccessTokenUserInfoDTO,
  AuthTokenPairDTO,
  CreateUserRequestDTO,
  UserForLoginAttemptValidation,
} from 'src/types';
import { AccessTokenDTO, RefreshTokenDTO } from 'src/types';
import { AccessTokenPayloadDTO, RefreshTokenPayloadDTO } from 'src/types';
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
    configService: DI_TypedConfigService<ISecretConfigMap>,
  ) {
    this.AUTH_JWT_SECRET = configService.get(ConfigKeys.AUTH_JWT_SECRET);
    this.USER_PASSWORD_HASH_SALT = configService.get(
      ConfigKeys.USER_PASSWORD_HASH_SALT_SECRET,
    );
  }

  async useRefreshTokenAndGetNewTokenPair(
    refreshTokenToBeOverwritten: string,
  ): Promise<AuthTokenPairDTO> {
    const payload = await this.assertRefreshTokenIsValidAndGetPayload(
      refreshTokenToBeOverwritten,
    );

    return await this.useRefreshTokenPayloadAndGetNewTokenPair(payload);
  }

  async useRefreshTokenPayloadAndGetNewTokenPair({
    sessionUUID,
    user: { id: userId },
  }: RefreshTokenPayloadDTO): Promise<AuthTokenPairDTO> {
    const user = await this.userUseCase.getOneByIdAsAccessTokenPayload(userId);

    const tokenPair = this.#createNewTokenPair({
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
    const { user } = await this.assertRefreshTokenIsValidAndGetPayload(
      refreshToken,
    );
    await this.redisSessionsService.finishAllSessions(user.id);
  }

  async finishSessionOfAnyUser(
    userId: number,
    sessionUUID: string,
  ): Promise<void> {
    await this.redisSessionsService.finishSession({ userId, sessionUUID });
  }

  async finishSessionOfLoggedInUser(refreshToken: string): Promise<void> {
    const { user, sessionUUID } =
      await this.assertRefreshTokenIsValidAndGetPayload(refreshToken);
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

  validateLoginAttempt(
    userModel: UserForLoginAttemptValidation,
    password: string,
  ): void {
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
  ): Promise<AuthTokenPairDTO> {
    const user = await this.userUseCase.createUser(createUserDTO);
    return await this.login({
      ...user,
      accessScopes: [],
    });
  }

  async login(user: AccessTokenUserInfoDTO): Promise<AuthTokenPairDTO> {
    const sessionUUID = uuid();

    const tokenPair = this.#createNewTokenPair({
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

  async assertAccessTokenIsValidAndGetPayload(
    accessToken: unknown,
  ): Promise<AccessTokenPayloadDTO> {
    return await this.assertTokenIsValidAndGetPayload(
      accessToken,
      AccessTokenDTO,
      'access',
      messages.auth.accessTokenExpired,
      messages.auth.missingAccessTokenCookie,
      messages.auth.invalidAccessToken,
      messages.auth.accessTokenWasBlacklisted,
    );
  }

  async assertRefreshTokenIsValidAndGetPayload(
    refreshToken: unknown,
  ): Promise<RefreshTokenPayloadDTO> {
    return await this.assertTokenIsValidAndGetPayload(
      refreshToken,
      RefreshTokenDTO,
      'refresh',
      messages.auth.refreshTokenExpired,
      messages.auth.missingRefreshTokenCookie,
      messages.auth.invalidRefreshToken,
      messages.auth.refreshTokenWasBlacklisted,
    );
  }

  private async assertTokenIsValidAndGetPayload<
    TokenDTO extends RefreshTokenDTO,
  >(
    token: unknown,
    tokenDTO: new () => TokenDTO,
    tokenField: 'access' | 'refresh',
    tokenExpiredMessage: string,
    tokenEmptyMessage: string,
    tokenInvalidMessage: string,
    tokenBlacklistedMessage: string,
  ): Promise<TokenDTO['payload']> {
    if (typeof token !== 'string' || !token)
      throw new UnauthorizedException(tokenEmptyMessage);

    let jwtBody: TokenDTO;

    try {
      jwtBody = this.jwtService.verify(token, {
        secret: this.AUTH_JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new UnauthorizedException(tokenExpiredMessage);
      throw new UnauthorizedException(tokenInvalidMessage);
    }

    const { errors, payloadInstance: tokenInstance } = validate(
      jwtBody,
      tokenDTO,
    );

    if (errors.length) {
      console.log(tokenInvalidMessage);
      logObjectNicely(errors);
      throw new UnauthorizedException(tokenInvalidMessage);
    }

    const hasTokenBeenWhitelisted =
      await this.redisSessionsService.hasTokenBeenWhitelisted({
        userId: tokenInstance.payload.user.id,
        sessionUUID: tokenInstance.payload.sessionUUID,
        token,
        tokenField,
      });

    if (!hasTokenBeenWhitelisted)
      throw new UnauthorizedException(tokenBlacklistedMessage);

    return tokenInstance.payload;
  }

  #createNewTokenPair(payload: AccessTokenPayloadDTO): AuthTokenPairDTO {
    //! tokens generated in different points in time are not equal because they always have different
    //! expiration dates, and there is no need to add additional seed to distinguish them
    return {
      accessToken: this.#createNewAccessToken(payload),
      refreshToken: this.#createNewRefreshToken(payload),
    };
  }

  #createNewAccessToken(payload: AccessTokenPayloadDTO): string {
    const { errors } = validate(payload, AccessTokenPayloadDTO);

    if (errors.length) {
      const message = messages.auth.doesNotSatisfyPayloadOfAccessToken(payload);
      console.log('InternalServerError: ', message);
      logObjectNicely(errors);
      throw new InternalServerErrorException(message);
    }
    return this.jwtService.sign({ payload }, { expiresIn: '20m' });
  }

  #createNewRefreshToken({ user, sessionUUID }: AccessTokenPayloadDTO): string {
    const payload: RefreshTokenPayloadDTO = {
      user: {
        id: user.id,
      },
      sessionUUID,
    };

    const { errors } = validate(payload, RefreshTokenPayloadDTO);

    if (errors.length) {
      const message =
        messages.auth.doesNotSatisfyPayloadOfRefreshToken(payload);
      console.log('InternalServerError: ', message);
      logObjectNicely(errors);
      throw new InternalServerErrorException(message);
    }
    return this.jwtService.sign({ payload }, { expiresIn: '7d' });
  }
}

export const AuthTokenPairUseCaseProvider: Provider = {
  provide: DI_AuthTokenPairUseCase,
  useClass: AuthTokenPairUseCase,
};
