import { UniversalTokenPart } from './universalTokenPart';

export interface UserAccessTokenPayload extends UniversalTokenPart {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}
