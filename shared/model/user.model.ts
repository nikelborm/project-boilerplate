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

  phone?: string;

  patronymic!: string;

  gender!: string;

  avatarURL?: string;

  nickname!: string;

  createdAt!: Date;

  updatedAt!: Date;
}
