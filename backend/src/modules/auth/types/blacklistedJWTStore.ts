export abstract class BlacklistedJWTStore {
  abstract doBlacklistJWT(jwt: string): void;
  abstract forgotJWT(jwt: string): void;
  abstract wasJWTBlacklisted(jwt: string): boolean;
}
