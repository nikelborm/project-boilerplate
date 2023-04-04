import type { RedisNamespaceEnum } from '../types';

export abstract class DI_RedisMasterService {
  abstract doAllKeysExist<T extends string | number>(
    ns: RedisNamespaceEnum,
    keys: T[],
  ): Promise<boolean>;

  abstract doAllKeysFromDifferentNsExist(
    nsKeys: [RedisNamespaceEnum, string | number][],
  ): Promise<boolean>;

  abstract doesKeyExist(
    ns: RedisNamespaceEnum,
    key: string | number,
  ): Promise<boolean>;
}
