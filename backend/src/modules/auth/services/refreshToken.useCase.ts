import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRefreshTokenPayload } from '../types';
import { ConfigKeys, IAppConfigMap, UserAuthInfo } from 'src/types';
import { JwtService } from '@nestjs/jwt';
import { InMemoryWhitelistedSessionStore } from './inMemoryWhitelistedKeyStore.service';
import { messages } from 'src/config';

@Injectable()
export class RefreshTokenUseCase {
  private JWT_SECRET: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly whitelistedSessionStore: InMemoryWhitelistedSessionStore,
    private readonly configService: ConfigService<IAppConfigMap, true>,
  ) {
    this.JWT_SECRET = this.configService.get(ConfigKeys.JWT_SECRET);
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
        secret: this.JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch (error) {
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
      throw new UnauthorizedException(messages.auth.invalidRefreshToken);

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
