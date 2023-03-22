import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigKeys, DI_TypedConfigService, IAppConfigMap } from 'src/config';
import { UserModule } from '../user';
import { AuthController } from './auth.controller';
import { DI_AuthUseCase } from './di';
import { AccessTokenGuard } from './guards';
import {
  AccessTokenUseCaseProvider,
  AuthUseCaseProvider,
  InMemoryWhitelistedSessionStoreProvider,
  RefreshTokenUseCaseProvider,
} from './services';
import { LocalStrategy } from './strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: DI_TypedConfigService<IAppConfigMap>) => ({
        secret: configService.get(ConfigKeys.AUTH_JWT_SECRET),
      }),
      inject: [DI_TypedConfigService],
    }),
  ],
  providers: [
    AuthUseCaseProvider,
    AccessTokenUseCaseProvider,
    RefreshTokenUseCaseProvider,
    InMemoryWhitelistedSessionStoreProvider,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
  controllers: [AuthController],
  exports: [DI_AuthUseCase],
})
export class AuthModule {}
