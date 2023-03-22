import { IsPositive } from 'class-validator';
import {
  BasicUserInfoWithNullableAvatarDTO,
  BasicUserInfoWithOptionalAvatarDTO,
} from './basicUserInfo.dto';

export class BasicUserInfoWithNullableAvatarWithIdDTO extends BasicUserInfoWithNullableAvatarDTO {
  @IsPositive()
  id!: number;
}
export class BasicUserInfoWithOptionalAvatarWithIdDTO extends BasicUserInfoWithOptionalAvatarDTO {
  @IsPositive()
  id!: number;
}
