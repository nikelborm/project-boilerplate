import type { Provider } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { DI_MASTER_REDIS_CLIENT, DI_RedisMasterService } from '../di';
import { nsKey } from '../tools';
import type { RedisNamespaceEnum } from '../types';
import { RedisMasterClient } from '../types';

@Injectable()
class RedisMasterService implements DI_RedisMasterService {
  constructor(
    @Inject(DI_MASTER_REDIS_CLIENT)
    private readonly masterClient: RedisMasterClient,
  ) {}

  async doAllKeysExist<T extends string | number>(
    ns: RedisNamespaceEnum,
    keys: T[],
  ): Promise<boolean> {
    const foundKeysAmount = await this.masterClient.exists(
      keys.map((key) => nsKey(ns, key)),
    );
    return foundKeysAmount === keys.length;
  }

  async doAllKeysFromDifferentNsExist(
    nsKeys: [RedisNamespaceEnum, string | number][],
  ): Promise<boolean> {
    const foundKeysAmount = await this.masterClient.exists(
      nsKeys.map(([ns, key]) => nsKey(ns, key)),
    );
    return foundKeysAmount === nsKeys.length;
  }

  async doesKeyExist(
    ns: RedisNamespaceEnum,
    key: string | number,
  ): Promise<boolean> {
    return await this.doAllKeysExist(ns, [key]);
  }
}

export const RedisMasterServiceProvider: Provider = {
  provide: DI_RedisMasterService,
  useClass: RedisMasterService,
};
