import { isNumberString, isString } from 'class-validator';
import { BootstrapMode } from '../types';
import { assertBootstrapModeIsCorrect } from './assertBootstrapModeIsCorrect';
import { assertMockScriptNameIsCorrect } from './assertMockScriptNameIsCorrect';

export function validateEntireConfig(
  config: Record<string, any>,
): Record<string, any> {
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
    config['REDIS_MASTER_PORT'],
    config['REDIS_MASTER_HOST'],
    config['REDIS_MASTER_PASSWORD'],
    config['REDIS_REPLICA_PORT'],
    config['REDIS_REPLICA_HOST'],
    config['REDIS_REPLICA_PASSWORD'],
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
    !isNumberString(config['REDIS_MASTER_PORT']) ||
    !isNumberString(config['REDIS_REPLICA_PORT']) ||
    !isNumberString(config['WEB_SOCKET_SERVER_PORT'])
  )
    throw new Error('Some of the ports in env does not looks like a number');

  const isPort = (key: string): boolean => {
    const x = parseInt(config[key], 10);
    return x >= 1 && x <= 65535;
  };

  if (
    !isPort('SERVER_PORT') ||
    !isPort('DATABASE_PORT') ||
    !isPort('REDIS_MASTER_PORT') ||
    !isPort('REDIS_REPLICA_PORT') ||
    !isPort('WEB_SOCKET_SERVER_PORT')
  )
    throw new Error(
      'Some of the ports in env does not looks like a port (probably too big or too small, or fractional)',
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
  if (config['NODE_ENV'] === 'development') console.log('config: ', config);
  return config;
}
