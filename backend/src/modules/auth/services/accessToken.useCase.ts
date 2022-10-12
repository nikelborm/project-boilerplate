import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import {
  ConfigKeys,
  IAppConfigMap,
  messages,
  TypedConfigService,
} from 'src/config';
import { UserAccessTokenPayload, UserAuthInfo } from 'src/types';
import { InMemoryWhitelistedSessionStore } from './inMemoryWhitelistedKeyStore.service';

@Injectable()
export class AccessTokenUseCase {
  private readonly AUTH_JWT_SECRET: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly whitelistedSessionStore: InMemoryWhitelistedSessionStore,
    private readonly configService: TypedConfigService<IAppConfigMap>,
  ) {
    this.AUTH_JWT_SECRET = this.configService.get(ConfigKeys.AUTH_JWT_SECRET);
  }

  getAccessToken(user: UserAuthInfo, sessionUUID: string): string {
    return this.jwtService.sign(this.getAccessTokenPayload(user, sessionUUID), {
      expiresIn: '20m',
    });
  }

  private getAccessTokenPayload(
    user: UserAuthInfo,
    sessionUUID: string,
  ): UserAccessTokenPayload {
    return {
      sessionUUID,
      user,
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
        secret: this.AUTH_JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new UnauthorizedException(messages.auth.accessTokenExpired);
      throw new UnauthorizedException(messages.auth.invalidAccessToken);
    }

    const { user, sessionUUID } = this.jwtService.decode(
      accessToken,
    ) as UserAccessTokenPayload;

    if (
      !(await this.whitelistedSessionStore.wasWhitelisted(user.id, sessionUUID))
    )
      throw new UnauthorizedException(messages.auth.yourSessionWasFinished);

    return user.id;
  }
}
