import { IsString, MaxLength, MinLength } from 'class-validator';

export class SetMyPasswordDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
