import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import {
  ConfigKeys,
  IAppConfigMap,
  messages,
  TypedConfigService,
} from 'src/config';
import { UserAuthInfo, UserRefreshTokenPayload } from 'src/types';
import { InMemoryWhitelistedSessionStore } from './inMemoryWhitelistedKeyStore.service';

@Injectable()
export class RefreshTokenUseCase {
  private readonly AUTH_JWT_SECRET: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly whitelistedSessionStore: InMemoryWhitelistedSessionStore,
    private readonly configService: TypedConfigService<IAppConfigMap>,
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
