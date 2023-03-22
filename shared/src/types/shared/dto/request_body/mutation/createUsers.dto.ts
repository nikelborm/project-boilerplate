import { IsString, MaxLength, MinLength } from 'class-validator';
import { NestedArrayDTO } from '../../../../../tools/shared';

import { BasicUserInfoWithOptionalAvatarDTO } from '../../other/basicUserInfo.dto';

export class CreateUserRequestDTO extends BasicUserInfoWithOptionalAvatarDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class CreateUsersRequestDTO {
  @NestedArrayDTO(() => CreateUserRequestDTO)
  users!: CreateUserRequestDTO[];
}
