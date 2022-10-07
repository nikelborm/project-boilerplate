import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { CreateUserDTO } from './createUser.dto';

export class CreateUsersDTO {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDTO)
  users!: CreateUserDTO[];
}
