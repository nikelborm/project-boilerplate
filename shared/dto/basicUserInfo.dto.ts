import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class BasicUserInfoDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  patronymic!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  gender!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  phone?: string;

  @IsEmail()
  @MinLength(2)
  @MaxLength(50)
  email!: string;
}
