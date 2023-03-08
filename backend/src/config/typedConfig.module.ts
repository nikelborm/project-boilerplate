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
        if (
          [
            config.AUTH_JWT_SECRET,
            config.BOOTSTRAP_MODE,
            config.DATABASE_HOST,
            config.DATABASE_NAME,
            config.DATABASE_PASSWORD,
            config.DATABASE_PORT,
            config.DATABASE_TYPEORM_LOGGING_MODE,
            config.DATABASE_USERNAME,
            config.INVITE_USERS_SIGN_KEY,
            config.MOCK_SCRIPT_NAME,
            config.NODE_ENV,
            config.SERVER_PORT,
            config.USER_PASSWORD_HASH_SALT,
            config.WEB_SOCKET_SERVER_PORT,
            config.WEB_SOCKET_SERVER_PATH,
          ].some((value) => !isString(value))
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

        if (!['production', 'development'].includes(config.NODE_ENV))
          throw new Error(
            'env.NODE_ENV should be either "production" or "development"',
          );

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
        if (config.NODE_ENV === 'development') console.log('config: ', config);
        return config;
      },
    }),
  ],
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class TypedConfigModule {}
