import { IsString, MaxLength, MinLength } from 'class-validator';
import { BasicUserInfoDTO } from '../../other/basicUserInfo.dto';

export class CreateUserDTO extends BasicUserInfoDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
