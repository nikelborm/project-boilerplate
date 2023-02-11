import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { dbConfig } from './db.config';
import { TypedConfigService } from './typedConfig.service';
import { isString, isNumberString } from 'class-validator';
import { assertMockScriptNameIsCorrect } from './mockUseCaseMethodsAllowedToBeExecuted';
import { assertBootstrapModeIsCorrect } from './allowedBootstrapModes';
import { BootstrapMode } from './types';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [appConfig, dbConfig],
      validate(config) {
        console.log('config: ', config);
        if (
          !isString(config.AUTH_JWT_SECRET) ||
          !isString(config.BOOTSTRAP_MODE) ||
          !isString(config.DATABASE_HOST) ||
          !isString(config.DATABASE_NAME) ||
          !isString(config.DATABASE_PASSWORD) ||
          !isString(config.DATABASE_PORT) ||
          !isString(config.DATABASE_TYPEORM_LOGGING_MODE) ||
          !isString(config.DATABASE_USERNAME) ||
          !isString(config.INVITE_USERS_SIGN_KEY) ||
          !isString(config.MOCK_SCRIPT_NAME) ||
          !isString(config.NODE_ENV) ||
          !isString(config.SERVER_PORT) ||
          !isString(config.USER_PASSWORD_HASH_SALT) ||
          !isString(config.WEB_SOCKET_SERVER_PORT)
        )
          throw new Error('Some of the env vars are not defined');

        if (
          !isNumberString(config.SERVER_PORT) ||
          !isNumberString(config.DATABASE_PORT) ||
          !isNumberString(config.WEB_SOCKET_SERVER_PORT)
        )
          throw new Error(
            'Some of the ports in env does not looks like a number',
          );

        assertBootstrapModeIsCorrect(config.BOOTSTRAP_MODE);

        if (
          [BootstrapMode.MOCK, BootstrapMode.MOCK_AND_ENDPOINTS].includes(
            config.BOOTSTRAP_MODE,
          )
        )
          assertMockScriptNameIsCorrect(config.MOCK_SCRIPT_NAME);

        if (
          config.AUTH_JWT_SECRET.length < 16 ||
          config.DATABASE_HOST.length < 4 ||
          !config.DATABASE_NAME.length ||
          config.DATABASE_PASSWORD.length < 10 ||
          !config.DATABASE_TYPEORM_LOGGING_MODE.length ||
          !config.DATABASE_USERNAME.length ||
          config.INVITE_USERS_SIGN_KEY.length < 16 ||
          !config.NODE_ENV.length ||
          config.USER_PASSWORD_HASH_SALT.length < 16
        )
          throw new Error('Some of the env vars are too short');

        return config;
      },
    }),
  ],
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class TypedConfigModule {}
