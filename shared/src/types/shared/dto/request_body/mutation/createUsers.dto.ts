import { IsString, MaxLength, MinLength } from 'class-validator';
import { NestedArrayDTO } from '../../../../../tools/shared';

import { BasicUserInfoDTO } from '../../other/basicUserInfo.dto';

export class CreateUserDTO extends BasicUserInfoDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class CreateUsersDTO {
  @NestedArrayDTO(() => CreateUserDTO)
  users!: CreateUserDTO[];
}
