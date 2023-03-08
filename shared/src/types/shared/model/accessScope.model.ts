import type { AccessScopeType } from '../accessScopeType';
import type { IUser, IUserToAccessScope } from '.';

export class IAccessScope {
  id!: number;

  type!: AccessScopeType;

  usersWithThatAccessScope!: IUser[];

  userToAccessScopeRelations!: IUserToAccessScope[];

  createdAt!: Date;

  updatedAt!: Date;
}
