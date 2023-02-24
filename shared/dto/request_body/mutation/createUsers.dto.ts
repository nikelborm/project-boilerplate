import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { BasicUserInfoDTO } from '../../other/basicUserInfo.dto';

export class CreateUserDTO extends BasicUserInfoDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class CreateUsersDTO {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDTO)
  users!: CreateUserDTO[];
}
