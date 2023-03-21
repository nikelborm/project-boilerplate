import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import {
  ConfigKeys,
  IAppConfigMap,
  messages,
  TypedConfigService,
} from 'src/config';
import { UserUseCase } from 'src/user';
import type {
  AuthTokenPairDTO,
  CreateUserDTO,
  RegisterUserResponseDTO,
  UserAuthInfo,
  UserForLoginAttemptValidation,
} from 'src/types';
import { v4 as uuid } from 'uuid';
import { AccessTokenUseCase } from './accessToken.useCase';
import { InMemoryWhitelistedSessionStore } from './inMemoryWhitelistedKeyStore.service';
import { RefreshTokenUseCase } from './refreshToken.useCase';

@Injectable()
export class AuthUseCase {
  private readonly USER_PASSWORD_HASH_SALT: string;

  constructor(
    private readonly accessTokenUseCase: AccessTokenUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly userUseCase: UserUseCase,
    private readonly configService: TypedConfigService<IAppConfigMap>,
    private readonly whitelistedSessionStore: InMemoryWhitelistedSessionStore,
  ) {
    this.USER_PASSWORD_HASH_SALT = this.configService.get(
      ConfigKeys.USER_PASSWORD_HASH_SALT,
    );
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
    createUserDTO: CreateUserDTO,
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
    const newSessionUUID = uuid();

    await this.whitelistedSessionStore.updateSessionsOf(user.id, {
      sessionToAdd: {
        uuid: newSessionUUID,
        expirationDate: new Date(), // TODO: реализовать нормальный механизм очистки токенов, которые уже не годны просто потому что истекли
      },
    });

    return {
      accessToken: this.accessTokenUseCase.getAccessToken(user, newSessionUUID),
      refreshToken: this.refreshTokenUseCase.getRefreshToken(
        user,
        newSessionUUID,
      ),
    };
  }

  async useRefreshTokenAndGetNewTokenPair(
    refreshToken: string,
  ): Promise<AuthTokenPairDTO> {
    const {
      sessionUUID: uuidOfSessionToRemove,
      user: { id: userId },
    } = await this.refreshTokenUseCase.decodeRefreshTokenAndGetPayload(
      refreshToken,
    );

    const newSessionUUID = uuid();

    await this.whitelistedSessionStore.updateSessionsOf(userId, {
      sessionToAdd: {
        uuid: newSessionUUID,
        expirationDate: new Date(), // TODO: реализовать нормальный механизм очистки токенов, которые уже не годны просто потому что истекли
      },
      uuidOfSessionToRemove,
    });

    const user = await this.userUseCase.getOneByIdWithAccessScopes(userId);

    return {
      accessToken: this.accessTokenUseCase.getAccessToken(user, newSessionUUID),
      refreshToken: this.refreshTokenUseCase.getRefreshToken(
        user,
        newSessionUUID,
      ),
    };
  }

  async logoutAllSessions(userId: number): Promise<void> {
    await this.whitelistedSessionStore.removeAllSessionsOf(userId);
  }

  async logoutSessionOf(userId: number, sessionUUID: string): Promise<void> {
    await this.whitelistedSessionStore.updateSessionsOf(userId, {
      uuidOfSessionToRemove: sessionUUID,
    });
  }

  // private async getAccessAndRefreshToken(
  //   user: UserAuthInfo,
  // ): Promise<TokenPairDTO> {

  // }
}
