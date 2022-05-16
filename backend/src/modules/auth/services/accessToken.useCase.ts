import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { messages } from 'src/config';
import { UserAccessTokenPayload } from '../types';
import { ConfigKeys, IAppConfigMap, UserAuthInfo } from 'src/types';
import { InMemoryWhitelistedSessionStore } from './inMemoryWhitelistedKeyStore.service';

@Injectable()
export class AccessTokenUseCase {
  private JWT_SECRET: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly whitelistedSessionStore: InMemoryWhitelistedSessionStore,
    private readonly configService: ConfigService<IAppConfigMap, true>,
  ) {
    this.JWT_SECRET = this.configService.get(ConfigKeys.JWT_SECRET);
  }

  getAccessToken(user: UserAuthInfo, sessionUUID: string): string {
    return this.jwtService.sign(this.getAccessTokenPayload(user, sessionUUID), {
      expiresIn: '10m',
    });
  }

  private getAccessTokenPayload(
    user: UserAuthInfo,
    sessionUUID: string,
  ): UserAccessTokenPayload {
    return {
      sessionUUID,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async decodeAuthHeaderAndGetUserId(
    authHeader: string | undefined,
  ): Promise<number> {
    if (!authHeader)
      throw new UnauthorizedException(messages.auth.missingAuthHeader);

    const [type, accessToken] = authHeader.split(' ');

    if (type !== 'Bearer')
      throw new UnauthorizedException(messages.auth.incorrectTokenType);

    if (!accessToken)
      throw new UnauthorizedException(messages.auth.missingToken);

    try {
      this.jwtService.verify(accessToken, {
        secret: this.JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch (error) {
      throw new UnauthorizedException(messages.auth.invalidAccessToken);
    }

    const { user, sessionUUID } = this.jwtService.decode(
      accessToken,
    ) as UserAccessTokenPayload;

    if (
      !(await this.whitelistedSessionStore.wasWhitelisted(user.id, sessionUUID))
    )
      throw new UnauthorizedException(messages.auth.invalidAccessToken);

    return user.id;
  }
}
