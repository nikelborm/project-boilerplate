import type { AccessScopeType } from '../modelHelper';
import type { IUser, IUserToAccessScope } from '.';

export class IAccessScope {
  id!: number;

  type!: AccessScopeType;

  usersWithThatAccessScope!: IUser[];

  userToAccessScopeRelations!: IUserToAccessScope[];

  createdAt!: Date;

  updatedAt!: Date;
}
