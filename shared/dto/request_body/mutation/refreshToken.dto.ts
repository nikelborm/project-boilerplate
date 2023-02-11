import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDTO {
  @IsString()
  @MinLength(100)
  refreshToken!: string;
}
