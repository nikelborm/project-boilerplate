import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy, LocalStrategy } from './strategy';
import { JwtAuthGuard } from './guards';
import { ConfigKeys, IAppConfigMap } from 'src/types';
import { BlacklistedJWTStore } from './types';
import { BlacklistedJWTStoreInMemory, AuthService } from './services';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<IAppConfigMap, true>) => ({
        secret: configService.get(ConfigKeys.JWT_SECRET),
        signOptions: { expiresIn: '6h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: BlacklistedJWTStore,
      useClass: BlacklistedJWTStoreInMemory,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
