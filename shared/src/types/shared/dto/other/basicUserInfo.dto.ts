import {
  IsEmail,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  AllowToBeNotDefinedOrDefinedAsNullButFailIfEqualsUndefined,
  AllowToBeNullButFailIfNotDefinedOrEqualsUndefined,
} from '../../../../tools/shared';

class BasicUserInfoDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  patronymic!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  gender!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nickname!: string;

  @IsEmail()
  @MinLength(2)
  @MaxLength(50)
  email!: string;
}

export class BasicUserInfoWithOptionalAvatarDTO extends BasicUserInfoDTO {
  @AllowToBeNotDefinedOrDefinedAsNullButFailIfEqualsUndefined()
  @IsUrl()
  @MinLength(2)
  avatarURL?: string | null;

  @AllowToBeNotDefinedOrDefinedAsNullButFailIfEqualsUndefined()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  phone?: string | null;
}

export class BasicUserInfoWithNullableAvatarDTO extends BasicUserInfoDTO {
  @AllowToBeNullButFailIfNotDefinedOrEqualsUndefined()
  @IsUrl()
  @MinLength(2)
  avatarURL!: string | null;

  @AllowToBeNullButFailIfNotDefinedOrEqualsUndefined()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  phone!: string | null;

}
