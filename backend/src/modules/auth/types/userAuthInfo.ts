import type { AccessScopeType } from 'src/types';

export interface UserAuthInfo {
  id: number;
  firstName: string;
  lastName: string;
  accessScopes: {
    id: number;
    type: AccessScopeType;
  }[];
}
