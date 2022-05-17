import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  ConfigKeys,
  IAppConfigMap,
  AllowedForArgs,
  EndpointAccess,
  UserLevelScopes,
  UserAuthInfo,
} from 'src/types';
import { messages } from 'src/config';
import { AccessEnum, ALLOWED_SCOPES_KEY } from 'src/tools';
import { AccessTokenUseCase } from '../services';
import { repo } from 'src/modules/infrastructure';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private IS_DEVELOPMENT: boolean;

  constructor(
    private readonly configService: ConfigService<IAppConfigMap, true>,
    private readonly accessTokenUseCase: AccessTokenUseCase,
    private readonly userRepo: repo.UserRepo,
    private readonly reflector: Reflector,
  ) {
    this.IS_DEVELOPMENT = this.configService.get(ConfigKeys.IS_DEVELOPMENT);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [allScopes, request] = this.getRouteScopesAndRequestFrom(context);

    if (!allScopes) return true;

    if (!allScopes.length) return true;

    const routeLevelScope = allScopes.find((scope) =>
      Object.values(EndpointAccess).includes(scope as any),
    ) as EndpointAccess;

    const userLevelScopes = (allScopes as UserLevelScopes[]).filter(
      (scope) => !Object.values(EndpointAccess).includes(scope as any),
    );

    if (routeLevelScope === AccessEnum.PUBLIC) return true;

    if (routeLevelScope === AccessEnum.FORBIDDEN) return false;

    if (routeLevelScope === AccessEnum.DEVELOPMENT_ONLY)
      if (this.IS_DEVELOPMENT) return true;
      else throw new UnauthorizedException(messages.auth.developmentOnly);

    if (
      routeLevelScope === AccessEnum.UNAUTHORIZED_ONLY &&
      !request.headers.authorization
    )
      throw new UnauthorizedException(messages.auth.unauthorizedOnly);

    const userId = await this.accessTokenUseCase.decodeAuthHeaderAndGetUserId(
      request.headers.authorization,
    );

    const userFromDB: UserAuthInfo =
      await this.userRepo.getOneByIdWithAccessScopes(userId);

    request.user = userFromDB;

    if (routeLevelScope === AccessEnum.AUTHORIZED) return true;

    const userAccessScopeTypes = new Set(
      userFromDB.accessScopes.map(({ type }) => type),
    );

    for (const endpointAccessScope of userLevelScopes) {
      if (Array.isArray(endpointAccessScope)) {
        if (endpointAccessScope.every(userAccessScopeTypes.has)) return true;
        continue;
      }

      if (userAccessScopeTypes.has(endpointAccessScope)) return true;
    }
    return false;
  }

  private getRouteScopesAndRequestFrom(
    context: ExecutionContext,
  ): [AllowedForArgs | null, Request] {
    return [
      this.reflector.get<AllowedForArgs>(
        ALLOWED_SCOPES_KEY,
        context.getHandler(),
      ),
      context.getArgByIndex<Request>(0),
    ];
  }
}
