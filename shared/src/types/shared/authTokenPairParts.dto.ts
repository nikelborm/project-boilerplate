import {
  IsEmail,
  IsEnum,
  IsPositive,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';
import {
  AllowToBeNullButFailIfNotDefinedOrEqualsUndefined,
  NestedArrayDTO,
  NestedDTO,
} from '../../tools/shared';
import { AccessScopeType } from './modelHelper/accessScopeType';

export class RefreshTokenUserInfo {
  @IsPositive()
  id!: number;
}

class MiniAccessScopeDTO {
  @IsPositive()
  id!: number;

  @IsEnum(AccessScopeType)
  type!: AccessScopeType;
}

export class AccessTokenUserInfoDTO extends RefreshTokenUserInfo {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @AllowToBeNullButFailIfNotDefinedOrEqualsUndefined()
  @IsUrl()
  avatarURL!: string | null;

  @IsString()
  nickname!: string;

  @NestedArrayDTO(() => MiniAccessScopeDTO)
  accessScopes!: MiniAccessScopeDTO[];
}

export class TokenCommonPayloadPartDTO {
  @IsUUID('4')
  sessionUUID!: string;
}

export class RefreshTokenPayloadDTO extends TokenCommonPayloadPartDTO {
  @NestedDTO(() => RefreshTokenUserInfo)
  user!: RefreshTokenUserInfo;
}

export class AccessTokenPayloadDTO extends TokenCommonPayloadPartDTO {
  @NestedDTO(() => AccessTokenUserInfoDTO)
  user!: AccessTokenUserInfoDTO;
}

export class TokenCommonPartDTO {
  @IsPositive()
  iat!: number;

  @IsPositive()
  exp!: number;
}

export class RefreshTokenDTO extends TokenCommonPartDTO {
  @NestedDTO(() => RefreshTokenPayloadDTO)
  payload!: RefreshTokenPayloadDTO;
}

export class AccessTokenDTO extends TokenCommonPartDTO {
  @NestedDTO(() => AccessTokenPayloadDTO)
  payload!: AccessTokenPayloadDTO;
}
