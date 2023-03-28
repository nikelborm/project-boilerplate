import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigKeys, DI_TypedConfigService, IAppConfigMap } from 'src/config';
import { getDefaultConfiguredRedisModule } from 'src/infrastructure';
import { UserModule } from '../user';
import { AuthController } from './auth.controller';
import { AuthTokenPairUseCaseProvider } from './authTokenPair.useCase';
import { DI_AuthTokenPairUseCase } from './di';
import { AccessTokenGuard } from './guards';
import { LocalStrategy } from './strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    getDefaultConfiguredRedisModule(),
    JwtModule.registerAsync({
      useFactory: (configService: DI_TypedConfigService<IAppConfigMap>) => ({
        secret: configService.get(ConfigKeys.AUTH_JWT_SECRET),
      }),
      inject: [DI_TypedConfigService],
    }),
  ],
  providers: [
    AuthTokenPairUseCaseProvider,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
  controllers: [AuthController],
  exports: [DI_AuthTokenPairUseCase],
})
export class AuthModule {}
