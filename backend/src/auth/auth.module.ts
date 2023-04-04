import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { ISecretConfigMap } from 'src/config';
import { ConfigKeys, DI_TypedConfigService } from 'src/config';
import { getDefaultConfiguredRedisModule } from 'src/infrastructure';
import { UserModule } from '../user';
import { AuthController } from './auth.controller';
import { AuthTokenPairUseCaseProvider } from './authTokenPair.useCase';
import { DI_AuthTokenPairUseCase } from './di';
import { JWTPairAndRouteAccessGuard } from './guards';
import { GoogleStrategy, LocalStrategy } from './strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    getDefaultConfiguredRedisModule(),
    JwtModule.registerAsync({
      useFactory: (configService: DI_TypedConfigService<ISecretConfigMap>) => ({
        secret: configService.get(ConfigKeys.AUTH_JWT_SECRET),
      }),
      inject: [DI_TypedConfigService],
    }),
  ],
  providers: [
    AuthTokenPairUseCaseProvider,
    LocalStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JWTPairAndRouteAccessGuard,
    },
  ],
  controllers: [AuthController],
  exports: [DI_AuthTokenPairUseCase],
})
export class AuthModule {}
