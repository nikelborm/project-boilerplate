import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ConfigKeys, IAppConfigMap } from 'src/types';
import { messages } from 'src/config';
import { AccessEnum, ALLOWED_SCOPES_KEY } from '../tools';
import { AllowedForArgs, EndpointAccess, UserLevelScopes } from '../types';
import { AuthService } from '../services';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private IS_DEVELOPMENT: boolean;

  constructor(
    private readonly configService: ConfigService<IAppConfigMap, true>,
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {
    this.IS_DEVELOPMENT = this.configService.get(ConfigKeys.IS_DEVELOPMENT);
  }

  async canActivate(context: ExecutionContext) {
    const [allScopes, request] = this.getRouteScopesAndRequestFrom(context);

    const routeLevelScope = allScopes.find((scope) =>
      Object.values(EndpointAccess).includes(scope as any),
    ) as EndpointAccess;

    const userLevelScopes = (allScopes as UserLevelScopes[]).filter(
      (scope) => !Object.values(EndpointAccess).includes(scope as any),
    );

    if (!allScopes) return true;

    if (!allScopes.length) return true;

    if (routeLevelScope === AccessEnum.PUBLIC) return true;

    if (routeLevelScope === AccessEnum.FORBIDDEN) return false;

    if (routeLevelScope === AccessEnum.DEVELOPMENT_ONLY)
      if (this.IS_DEVELOPMENT) return true;
      else throw new UnauthorizedException(messages.auth.developmentOnly);

    const userModel = await this.authService.verify(
      request.headers.authorization,
    );

    request.user = userModel;

    if (routeLevelScope === AccessEnum.AUTHORIZED) return true;

    const userAccessScopeTypes = new Set(
      userModel.accessScopes.map(({ type }) => type),
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

  private getRouteScopesAndRequestFrom(context: ExecutionContext) {
    return [
      this.reflector.get<AllowedForArgs>(
        ALLOWED_SCOPES_KEY,
        context.getHandler(),
      ),
      context.getArgByIndex<Request>(0),
    ] as [AllowedForArgs, Request];
  }
}
