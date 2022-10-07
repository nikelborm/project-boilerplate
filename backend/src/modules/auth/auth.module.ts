import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategy';
import { AccessTokenGuard } from './guards';
import { ConfigKeys, IAppConfigMap } from 'src/types';
import {
  InMemoryWhitelistedSessionStore,
  AuthUseCase,
  RefreshTokenUseCase,
  AccessTokenUseCase,
} from './services';
import { UserModule } from '../user';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<IAppConfigMap, true>) => ({
        secret: configService.get(ConfigKeys.JWT_SECRET),
      }),
      inject: [ConfigService],
    }),

    UserModule,
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
