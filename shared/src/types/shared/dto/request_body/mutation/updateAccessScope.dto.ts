/* eslint-disable max-classes-per-file */
import { IsPositive } from 'class-validator';
import { NestedArrayDTO } from '../../../../../tools/shared';

class UserToHaveAccessScopeDTO {
  @IsPositive()
  id!: number;
}

export class UpdateAccessScopeDTO {
  @IsPositive()
  id!: number;

  @NestedArrayDTO(() => UserToHaveAccessScopeDTO)
  usersWithThatAccessScope!: UserToHaveAccessScopeDTO[];
}
