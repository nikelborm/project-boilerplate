import { Injectable, Provider, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import {
  ConfigKeys,
  IAppConfigMap,
  messages,
  DI_TypedConfigService,
} from 'src/config';
import type { UserAccessTokenPayload, UserAuthInfo } from 'src/types';
import { DI_AccessTokenUseCase, DI_WhitelistedSessionStore } from '../di';

@Injectable()
class AccessTokenUseCase implements DI_AccessTokenUseCase {
  private readonly AUTH_JWT_SECRET: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly whitelistedSessionStore: DI_WhitelistedSessionStore,
    private readonly configService: DI_TypedConfigService<IAppConfigMap>,
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
  ): Promise<{ userId: number }> {
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

    return { userId: user.id };
  }
}

export const AccessTokenUseCaseProvider: Provider = {
  provide: DI_AccessTokenUseCase,
  useClass: AccessTokenUseCase,
};
