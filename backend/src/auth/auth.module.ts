import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigKeys, IAppConfigMap, TypedConfigService } from 'src/config';
import { UserModule } from '../user';
import { AuthController } from './auth.controller';
import { AccessTokenGuard } from './guards';
import {
  AccessTokenUseCase,
  AuthUseCase,
  InMemoryWhitelistedSessionStore,
  RefreshTokenUseCase,
} from './services';
import { LocalStrategy } from './strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: TypedConfigService<IAppConfigMap>) => ({
        secret: configService.get(ConfigKeys.AUTH_JWT_SECRET),
      }),
      inject: [TypedConfigService],
    }),
  ],
  providers: [
    AuthUseCase,
    AccessTokenUseCase,
    RefreshTokenUseCase,
    InMemoryWhitelistedSessionStore,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthUseCase],
})
export class AuthModule {}
