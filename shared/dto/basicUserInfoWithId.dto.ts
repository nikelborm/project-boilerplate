import { IsPositive } from 'class-validator';
import { BasicUserInfoDTO } from './basicUserInfo.dto';

export class BasicUserInfoWithIdDTO extends BasicUserInfoDTO {
  @IsPositive()
  id!: number;
}
