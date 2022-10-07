/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class UpdatedUserDTO {
  @IsPositive()
  id!: number;
}

export class UpdateAccessScopeDTO {
  @IsPositive()
  id!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatedUserDTO)
  usersWithThatAccessScope?: UpdatedUserDTO[];
}
