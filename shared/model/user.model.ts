import type { IAccessScope, IUserToAccessScope } from '.';

export class IUser {
  id!: number;

  firstName!: string;

  lastName!: string;

  email!: string;

  salt!: string;

  passwordHash!: string;

  accessScopes!: IAccessScope[];

  userToAccessScopeRelations!: IUserToAccessScope[];

  patronymic!: string;

  gender!: string;

  phone?: string;

  createdAt!: Date;

  updatedAt!: Date;
}
