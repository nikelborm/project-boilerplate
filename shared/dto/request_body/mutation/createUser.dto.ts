import { IsString, MaxLength, MinLength } from 'class-validator';
import { BasicUserInfoDTO } from '../../basicUserInfo.dto';

export class CreateUserDTO extends BasicUserInfoDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
