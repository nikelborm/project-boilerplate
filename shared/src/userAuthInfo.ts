import type { AccessScopeType } from './accessScopeType';

export interface UserAuthInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  patronymic: string;
  gender: string;
  phone?: string | undefined;
  avatarURL?: string | undefined;
  nickname: string;
  accessScopes: {
    id: number;
    type: AccessScopeType;
  }[];
}
