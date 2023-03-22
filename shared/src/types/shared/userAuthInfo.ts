import type { AccessScopeType } from './modelHelper/accessScopeType';

export interface UserAuthInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  patronymic: string;
  gender: string;
  phone?: string | undefined;
  avatarURL: string | null;
  nickname: string;
  accessScopes: {
    id: number;
    type: AccessScopeType;
  }[];
}
