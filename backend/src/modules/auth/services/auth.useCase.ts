import { createHash, timingSafeEqual } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { messages } from 'src/config';
import { repo } from '../../infrastructure';
import { TokenPairDTO } from '../types';
import {
  ConfigKeys,
  CreateUserDTO,
  IAppConfigMap,
  UserAuthInfo,
  UserForLoginAttemptValidation,
} from 'src/types';
import { InMemoryWhitelistedSessionStore } from './inMemoryWhitelistedKeyStore.service';
import { RefreshTokenUseCase } from './refreshToken.useCase';
import { AccessTokenUseCase } from './accessToken.useCase';

import { v4 as uuid } from 'uuid';
import { UserUseCase } from 'src/modules/user';

@Injectable()
export class AuthUseCase {
  private USER_PASSWORD_HASH_SALT: string;

  constructor(
    private readonly accessTokenUseCase: AccessTokenUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly userUseCase: UserUseCase,
    private readonly userRepo: repo.UserRepo,
    private readonly configService: ConfigService<IAppConfigMap, true>,
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

  async registerNewUserAndLogin({
    firstName,
    lastName,
    email,
    password,
  }: CreateUserDTO): Promise<TokenPairDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { salt, passwordHash, ...user } = await this.userUseCase.createUser({
      firstName,
      lastName,
      email,
      password,
      accessScopes: [],
    });
    return await this.login(user);
  }

  async login(user: UserAuthInfo): Promise<TokenPairDTO> {
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
  ): Promise<TokenPairDTO> {
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

    const user = await this.userRepo.getOneByIdWithAccessScopes(userId);

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
