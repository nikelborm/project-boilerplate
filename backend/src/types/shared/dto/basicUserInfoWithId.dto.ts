import { IsPositive } from 'class-validator';
import { BasicUserInfoDTO } from './request_body';

export class BasicUserInfoWithIdDTO extends BasicUserInfoDTO {
  @IsPositive()
  id!: number;
}
