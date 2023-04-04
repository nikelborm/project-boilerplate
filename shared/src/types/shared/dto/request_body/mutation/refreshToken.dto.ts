import { IsString, MinLength } from 'class-validator';

export class RefreshTokenPairRequestDTO {
  @IsString()
  @MinLength(100)
  refreshToken!: string;
}
