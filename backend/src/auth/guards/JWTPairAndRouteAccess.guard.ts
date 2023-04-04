import type { CanActivate, ExecutionContext } from '@nestjs/common';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { IAppInitConfigMap } from 'src/config';
import { ConfigKeys, DI_TypedConfigService, messages } from 'src/config';
import { ALLOWED_SCOPES_KEY, AccessEnum } from 'src/tools';
import type {
  AllowedForArgs,
  AuthorizedRequest,
  RequestWithValidRefreshToken,
} from 'src/types';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  EndpointAccess,
  REFRESH_TOKEN_COOKIE_NAME,
} from 'src/types';

import { DI_AuthTokenPairUseCase } from '../di';

@Injectable()
export class JWTPairAndRouteAccessGuard implements CanActivate {
  private readonly IS_DEVELOPMENT: boolean;

  public constructor(
    private readonly authTokenPairUseCase: DI_AuthTokenPairUseCase,
    private readonly reflector: Reflector,
    configService: DI_TypedConfigService<IAppInitConfigMap>,
  ) {
    this.IS_DEVELOPMENT = configService.get(ConfigKeys.IS_DEVELOPMENT);
  }

  private getRouteScopesAndRequestFrom(
    context: ExecutionContext,
  ): [AllowedForArgs | undefined, ProbablyAuthorizedRequested] {
    return [
      this.reflector.get<AllowedForArgs>(
        ALLOWED_SCOPES_KEY,
        context.getHandler(),
      ),

      context.getArgByIndex<ProbablyAuthorizedRequested>(0),
    ];
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const [allScopes, request] = this.getRouteScopesAndRequestFrom(context);

    if (!allScopes || allScopes.length === 0) return true;

    const routeLevelScopes = allScopes.filter((scope) =>
      Object.values(EndpointAccess).includes(scope as string),
    ) as EndpointAccess[];

    if (routeLevelScopes.length !== 1)
      throw new UnauthorizedException(
        'You either set 1 and only 1 route level scope for endpoint or you set no scopes at all',
      );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const routeLevelScope = routeLevelScopes[0]!;

    if (routeLevelScope === AccessEnum.PUBLIC) return true;

    if (routeLevelScope === AccessEnum.FORBIDDEN) return false;

    if (routeLevelScope === AccessEnum.DEVELOPMENT_ONLY) {
      if (this.IS_DEVELOPMENT) return true;
      throw new UnauthorizedException(messages.auth.developmentOnly);
    }

    const signedCookies: unknown = request.signedCookies;

    const isObj = (o: unknown): o is Record<string, any> =>
      typeof o === 'object' && o !== null;

    if (routeLevelScope === AccessEnum.UNAUTHORIZED_ONLY) {
      if (
        !signedCookies ||
        (isObj(signedCookies) &&
          // eslint-disable-next-line security/detect-object-injection
          !signedCookies[ACCESS_TOKEN_COOKIE_NAME] &&
          // eslint-disable-next-line security/detect-object-injection
          !signedCookies[REFRESH_TOKEN_COOKIE_NAME])
      )
        return true;

      throw new UnauthorizedException(messages.auth.unauthorizedOnly);
    }

    if (!signedCookies || !isObj(signedCookies))
      throw new InternalServerErrorException(
        'Signed cookies are not provided for some reason',
      );

    if (
      routeLevelScope === AccessEnum.GOOD_REFRESH_TOKEN_ONLY ||
      routeLevelScope === AccessEnum.GOOD_ACCESS_AND_REFRESH_TOKEN_ONLY
    ) {
      const tokenPayload =
        await this.authTokenPairUseCase.assertRefreshTokenIsValidAndGetPayload(
          // eslint-disable-next-line security/detect-object-injection
          signedCookies[REFRESH_TOKEN_COOKIE_NAME],
        );
      request.sessionUUID = tokenPayload.sessionUUID;
      request.user = tokenPayload.user;

      if (routeLevelScope === AccessEnum.GOOD_REFRESH_TOKEN_ONLY) return true;
    }

    if (routeLevelScope !== AccessEnum.GOOD_ACCESS_AND_REFRESH_TOKEN_ONLY)
      throw new InternalServerErrorException(
        `Something extremely wrong with routeLevelScopes. This error should never happen. allScopes=${JSON.stringify(
          allScopes,
        )}`,
      );

    const tokenPayload =
      await this.authTokenPairUseCase.assertAccessTokenIsValidAndGetPayload(
        // eslint-disable-next-line security/detect-object-injection
        signedCookies[ACCESS_TOKEN_COOKIE_NAME],
      );

    request.user = tokenPayload.user;
    request.sessionUUID = tokenPayload.sessionUUID;

    // const userLevelScopes = allScopes.filter(
    //   (scope) => !Object.values(EndpointAccess).includes(scope),
    // ) as UserLevelScopes[];
    // const userAccessScopeTypes = new Set(
    //   userFromDB.accessScopes.map(({ type }) => type),
    // );

    // for (const endpointAccessScope of userLevelScopes) {
    //   if (Array.isArray(endpointAccessScope)) {
    //     if (endpointAccessScope.every(userAccessScopeTypes.has)) return true;
    //     continue;
    //   }

    //   if (userAccessScopeTypes.has(endpointAccessScope)) return true;
    // }
    // return false;
    // console.log('userLevelScopes:', userLevelScopes);
    return true;
  }
}

type ProbablyAuthorizedRequested =
  | (Partial<AuthorizedRequest> & Request)
  | (Partial<RequestWithValidRefreshToken> & Request);
