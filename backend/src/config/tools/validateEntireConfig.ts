import { Transform, plainToInstance } from 'class-transformer';
import {
  Equals,
  IsIn,
  IsString,
  MinLength,
  NotEquals,
  ValidateIf,
} from 'class-validator';
import { IsValidBootstrapMode } from '../../tools/private/decorators/isValidBootstrapMode.decorator';
import { IsValidMockScriptName } from '../../tools/private/decorators/isValidMockScriptName.decorator';
import { logObjectNicely } from '../../tools/private/logObjectNicely';
import { IsPortLikeNumericString } from '../../tools/shared/decorators/isPortLikeNumericString.decorator';
import { NestedDTO } from '../../tools/shared/decorators/nestedDTO.decorator';
import { validate } from '../../tools/shared/validate';
import { GoogleOAuthTokenSecretWrapperDTO } from '../../types/private/googleOAuthTokenSecret.dto';
import { BootstrapMode } from '../types/bootstrapMode';

class DatabaseConfigDTO {
  @IsString()
  @MinLength(3)
  DATABASE_HOST!: string;

  @IsString()
  @MinLength(3)
  DATABASE_NAME!: string;

  @IsString()
  @MinLength(12)
  DATABASE_PASSWORD!: string;

  @IsPortLikeNumericString()
  DATABASE_PORT!: string;

  @Transform(({ value }) => JSON.parse(value as string))
  DATABASE_TYPEORM_LOGGING_MODE!: string;

  @IsString()
  @MinLength(3)
  DATABASE_USERNAME!: string;
}

class ConfigInUsualServerMode extends DatabaseConfigDTO {
  @NotEquals('true')
  IS_SERVICE_HELPER_ONLY_MODE!: string;

  @IsString()
  @MinLength(16)
  AUTH_JWT_SECRET!: string;

  @IsValidBootstrapMode()
  BOOTSTRAP_MODE!: BootstrapMode;

  @IsString()
  @MinLength(16)
  INVITE_USERS_SIGN_KEY!: string;

  @IsString()
  @MinLength(16)
  COOKIE_SIGN_KEY!: string;

  @NestedDTO(() => GoogleOAuthTokenSecretWrapperDTO)
  @Transform(({ value }) =>
    plainToInstance(
      GoogleOAuthTokenSecretWrapperDTO,
      JSON.parse(value as string),
    ),
  )
  GOOGLE_OAUTH_TOKEN_SECRET!: GoogleOAuthTokenSecretWrapperDTO;

  @ValidateIf(
    (obj: unknown) =>
      typeof obj === 'object' &&
      !!obj &&
      'BOOTSTRAP_MODE' in obj &&
      typeof obj['BOOTSTRAP_MODE'] === 'string' &&
      [BootstrapMode.MOCK, BootstrapMode.MOCK_AND_ENDPOINTS].includes(
        obj['BOOTSTRAP_MODE'],
      ),
  )
  @IsValidMockScriptName()
  MOCK_SCRIPT_NAME!: string;

  @IsIn(['production', 'development'])
  NODE_ENV!: string;

  @IsPortLikeNumericString()
  SERVER_PORT!: string;

  @IsIn(['true', 'false'])
  ENABLE_SWAGGER_IN_PROD!: string;

  @IsString()
  @MinLength(16)
  USER_PASSWORD_HASH_SALT!: string;

  @IsPortLikeNumericString()
  WEB_SOCKET_SERVER_PORT!: string;

  @IsString()
  @MinLength(3)
  WEB_SOCKET_SERVER_PATH!: string;

  @IsPortLikeNumericString()
  REDIS_MASTER_PORT!: string;

  @IsString()
  @MinLength(3)
  REDIS_MASTER_HOST!: string;

  @IsString()
  @MinLength(16)
  REDIS_MASTER_PASSWORD!: string;

  @IsPortLikeNumericString()
  REDIS_REPLICA_PORT!: string;

  @IsString()
  @MinLength(3)
  REDIS_REPLICA_HOST!: string;

  @IsString()
  @MinLength(16)
  REDIS_REPLICA_PASSWORD!: string;
}

class ConfigInServiceHelperOnlyMode extends DatabaseConfigDTO {
  @Equals('true')
  IS_SERVICE_HELPER_ONLY_MODE!: string;
}

export function validateEntireConfig(
  config: Record<string, any>,
): Record<string, any> {
  const dtoClass =
    config['IS_SERVICE_HELPER_ONLY_MODE'] === 'true'
      ? ConfigInServiceHelperOnlyMode
      : ConfigInUsualServerMode;
  const { errors } = validate(config, dtoClass, {
    forbidNonWhitelisted: false,
  });
  if (errors.length) {
    logObjectNicely(errors);
    throw new Error(`process.env does not satisfy ${dtoClass.name}`);
  }

  if (config['NODE_ENV'] === 'development') console.log('config: ', config);

  return config;
}
