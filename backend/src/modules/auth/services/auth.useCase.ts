import { createHash, timingSafeEqual } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { messages } from 'src/config';
import { repo } from '../../infrastructure';
import { TokenPairDTO } from '../types';
import {
  ConfigKeys,
  IAppConfigMap,
  UserAuthInfo,
  UserForLoginAttemptValidation,
} from 'src/types';
import { InMemoryWhitelistedSessionStore } from './inMemoryWhitelistedKeyStore.service';
import { RefreshTokenUseCase } from './refreshToken.useCase';
import { AccessTokenUseCase } from './accessToken.useCase';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthUseCase {
  private USER_PASSWORD_HASH_SALT: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly accessTokenUseCase: AccessTokenUseCase,
    private readonly userRepo: repo.UserRepo,
    private readonly configService: ConfigService<IAppConfigMap, true>,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
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

    if (!userModel.accessScopes.length)
      throw new UnauthorizedException(messages.auth.userHasNoAccessScopes);
  }

  async register(): Promise<void> {
    return;
  }

  async logoutAllSessions(userId: number): Promise<void> {
    await this.whitelistedSessionStore.removeAllSessionsOf(userId);
  }

  async logoutSessionOf(userId: number, sessionUUID: string): Promise<void> {
    await this.whitelistedSessionStore.updateSessionsOf(userId, {
      uuidOfSessionToRemove: sessionUUID,
    });
  }

  async getAccessAndRefreshToken(user: UserAuthInfo): Promise<TokenPairDTO> {
    const userFromDatabase = await this.userRepo.getOneByIdWithAccessScopes(
      user.id,
    );
    const sessionUUID = uuid();
    return {
      accessToken: this.jwtService.sign(
        this.accessTokenUseCase.getAccessTokenPayload(
          userFromDatabase,
          sessionUUID,
        ),
        { expiresIn: '10m' },
      ),
      refreshToken: this.jwtService.sign(
        this.refreshTokenUseCase.getRefreshTokenPayload(
          userFromDatabase,
          sessionUUID,
        ),
        { expiresIn: '7d' },
      ),
    };
  }
}
