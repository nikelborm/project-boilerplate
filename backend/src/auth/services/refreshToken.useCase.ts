import { Injectable, Provider, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import {
  ConfigKeys,
  DI_TypedConfigService,
  IAppConfigMap,
  messages,
} from 'src/config';
import type { UserAuthInfo, UserRefreshTokenPayload } from 'src/types';
import { DI_RefreshTokenUseCase, DI_WhitelistedSessionStore } from '../di';

@Injectable()
class RefreshTokenUseCase implements DI_RefreshTokenUseCase {
  private readonly AUTH_JWT_SECRET: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly whitelistedSessionStore: DI_WhitelistedSessionStore,
    private readonly configService: DI_TypedConfigService<IAppConfigMap>,
  ) {
    this.AUTH_JWT_SECRET = this.configService.get(ConfigKeys.AUTH_JWT_SECRET);
  }

  getRefreshToken(user: UserAuthInfo, sessionUUID: string): string {
    return this.jwtService.sign(
      this.getRefreshTokenPayload(user, sessionUUID),
      { expiresIn: '7d' },
    );
  }

  async decodeRefreshTokenAndGetPayload(
    refreshToken: string,
  ): Promise<UserRefreshTokenPayload> {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.AUTH_JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new UnauthorizedException(messages.auth.yourSessionWasFinished);
      throw new UnauthorizedException(messages.auth.invalidRefreshToken);
    }

    const tokenPayload = this.jwtService.decode(
      refreshToken,
    ) as UserRefreshTokenPayload;

    if (
      !(await this.whitelistedSessionStore.wasWhitelisted(
        tokenPayload.user.id,
        tokenPayload.sessionUUID,
      ))
    )
      throw new UnauthorizedException(messages.auth.yourSessionWasFinished);

    return tokenPayload;
  }

  private getRefreshTokenPayload(
    user: UserAuthInfo,
    sessionUUID: string,
  ): UserRefreshTokenPayload {
    return {
      sessionUUID,
      user: {
        id: user.id,
      },
    };
  }
}

export const RefreshTokenUseCaseProvider: Provider = {
  provide: DI_RefreshTokenUseCase,
  useClass: RefreshTokenUseCase,
};
