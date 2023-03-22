import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { dbConfig } from './db.config';
import { DI_TypedConfigService } from './di';
import { isString, isNumberString } from 'class-validator';
import {
  assertMockScriptNameIsCorrect,
  assertBootstrapModeIsCorrect,
} from './tools';
import { BootstrapMode } from './types';
import { TypedConfigServiceProvider } from './typedConfig.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [appConfig, dbConfig],
      validate(config) {
        const envVarsToTestAreTheyStrings = [
          config['AUTH_JWT_SECRET'],
          config['BOOTSTRAP_MODE'],
          config['DATABASE_HOST'],
          config['DATABASE_NAME'],
          config['DATABASE_PASSWORD'],
          config['DATABASE_PORT'],
          config['DATABASE_TYPEORM_LOGGING_MODE'],
          config['DATABASE_USERNAME'],
          config['INVITE_USERS_SIGN_KEY'],
          config['MOCK_SCRIPT_NAME'],
          config['NODE_ENV'],
          config['SERVER_PORT'],
          config['USER_PASSWORD_HASH_SALT'],
          config['WEB_SOCKET_SERVER_PORT'],
          config['WEB_SOCKET_SERVER_PATH'],
        ];
        if (envVarsToTestAreTheyStrings.some((value) => !isString(value))) {
          console.log(envVarsToTestAreTheyStrings);
          throw new Error(
            `Some of the env vars are not defined: ${JSON.stringify(
              envVarsToTestAreTheyStrings,
              null,
              4,
            )}`,
          );
        }

        if (
          !isNumberString(config['SERVER_PORT']) ||
          !isNumberString(config['DATABASE_PORT']) ||
          !isNumberString(config['WEB_SOCKET_SERVER_PORT'])
        )
          throw new Error(
            'Some of the ports in env does not looks like a number',
          );

        assertBootstrapModeIsCorrect(config['BOOTSTRAP_MODE']);

        if (
          [BootstrapMode.MOCK, BootstrapMode.MOCK_AND_ENDPOINTS].includes(
            config['BOOTSTRAP_MODE'],
          )
        )
          assertMockScriptNameIsCorrect(config['MOCK_SCRIPT_NAME']);

        if (!['production', 'development'].includes(config['NODE_ENV']))
          throw new Error(
            'env.NODE_ENV should be either "production" or "development"',
          );

        if (
          config['AUTH_JWT_SECRET'].length < 16 ||
          config['DATABASE_HOST'].length < 4 ||
          !config['DATABASE_NAME'].length ||
          config['DATABASE_PASSWORD'].length < 10 ||
          !config['DATABASE_TYPEORM_LOGGING_MODE'].length ||
          !config['DATABASE_USERNAME'].length ||
          config['INVITE_USERS_SIGN_KEY'].length < 16 ||
          !config['NODE_ENV'].length ||
          config['USER_PASSWORD_HASH_SALT'].length < 16
        )
          throw new Error('Some of the env vars are too short');
        if (config['NODE_ENV'] === 'development')
          console.log('config: ', config);
        return config;
      },
    }),
  ],
  providers: [TypedConfigServiceProvider],
  exports: [DI_TypedConfigService],
})
export class TypedConfigModule {}
