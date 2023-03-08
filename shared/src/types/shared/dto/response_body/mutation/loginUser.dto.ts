import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserRequestDTO {
  @IsEmail()
  @MinLength(2)
  @MaxLength(50)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
