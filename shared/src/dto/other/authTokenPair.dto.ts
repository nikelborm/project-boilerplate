import { IsJWT } from 'class-validator';

export class AuthTokenPairDTO {
  @IsJWT()
  accessToken!: string;

  @IsJWT()
  refreshToken!: string;
}
