import { AccessScopeType } from './accessScopeType';

export interface UserAuthInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  gender: string;
  phone?: string | undefined;
  accessScopes: {
    id: number;
    type: AccessScopeType;
  }[];
}
