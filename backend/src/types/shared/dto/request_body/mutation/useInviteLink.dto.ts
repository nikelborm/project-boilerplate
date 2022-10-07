import { IsDateString, IsPositive, IsString, Length } from 'class-validator';

export class UseInviteLinkDTO {
  @IsPositive()
  givenByUserId!: number;

  @IsPositive()
  inviteToUserGroupId!: number;

  @IsDateString()
  expirationDate!: string;

  @IsString()
  @Length(64, 64)
  signature!: string;
}
