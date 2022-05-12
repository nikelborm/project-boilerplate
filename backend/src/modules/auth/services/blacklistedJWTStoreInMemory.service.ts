import { BlacklistedJWTStore } from '../types';

export class BlacklistedJWTStoreInMemory extends BlacklistedJWTStore {
  doBlacklistJWT(jwt: string): void {
    return;
  }

  forgotJWT(jwt: string): void {
    return;
  }

  wasJWTBlacklisted(jwt: string): boolean {
    return true;
  }
}
