import type { IAccessScope, IUser } from '.';

export class IUserToAccessScope {
  user!: IUser;

  userId!: number;

  accessScope!: IAccessScope;

  accessScopeId!: number;
}
