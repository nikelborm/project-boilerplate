import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
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
  AuthorizedRequest,
  RequestWithValidRefreshToken,
  UserLevelScopes,
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

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const [allScopes, request] = this.getRouteScopesAndRequestFrom(context);

    if (!allScopes || allScopes.length === 0) return true;

    const routeLevelScopes = allScopes.filter(
      (scope): scope is EndpointAccess =>
        Object.values(EndpointAccess).includes(scope as string),
    );

    this.#assertOnlyOneRouteLevelScope(routeLevelScopes);

    const routeLevelScope = routeLevelScopes[0];

    if (routeLevelScope === AccessEnum.PUBLIC) return true;

    if (routeLevelScope === AccessEnum.FORBIDDEN)
      throw new ForbiddenException('Endpoint forbidden for everyone forever');

    if (routeLevelScope === AccessEnum.DEVELOPMENT_ONLY) {
      if (this.IS_DEVELOPMENT) return true;
      throw new ForbiddenException(messages.auth.developmentOnly);
    }

    const signedCookies: unknown = request.signedCookies;

    const isObj = (o: unknown): o is Record<string, string> =>
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

      throw new ForbiddenException(messages.auth.unauthorizedOnly);
    }

    if (!signedCookies || !isObj(signedCookies))
      throw new UnauthorizedException(
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
        `Something is extremely wrong with routeLevelScopes. This error should never happen. allScopes=${JSON.stringify(
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

  #assertOnlyOneRouteLevelScope(
    routeScopes: EndpointAccess[],
  ): asserts routeScopes is [EndpointAccess] {
    if (routeScopes.length !== 1) {
      console.log('routeLevelScopes: ', routeScopes);
      throw new InternalServerErrorException(
        'You either set 1 and only 1 route level scope for endpoint or you set no scopes at all',
      );
    }
  }

  private getRouteScopesAndRequestFrom(context: ExecutionContext): [
    // it is not [EndpointAccess, ...UserLevelScopes[]] because we cannot guarantee that EndpointAccess comes first
    (EndpointAccess | UserLevelScopes)[] | undefined,
    ProbablyAuthorizedRequested,
  ] {
    return [
      this.reflector.get<(EndpointAccess | UserLevelScopes)[]>(
        ALLOWED_SCOPES_KEY,
        context.getHandler(),
      ),

      context.getArgByIndex<ProbablyAuthorizedRequested>(0),
    ];
  }
}

type ProbablyAuthorizedRequested =
  | (Partial<AuthorizedRequest> & Request)
  | (Partial<RequestWithValidRefreshToken> & Request);
