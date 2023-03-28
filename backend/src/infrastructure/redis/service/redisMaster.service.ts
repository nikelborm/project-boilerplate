import { Inject, Injectable, Provider } from '@nestjs/common';
import { DI_MASTER_REDIS_CLIENT, DI_RedisMasterService } from '../di';
import { ns_key } from '../tools';
import { RedisMasterClient, RedisNamespaceEnum } from '../types';

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
      keys.map((key) => ns_key(ns, key)),
    );
    return foundKeysAmount === keys.length;
  }

  async doAllKeysFromDifferentNsExist(
    ns_keys: [RedisNamespaceEnum, string | number][],
  ): Promise<boolean> {
    const foundKeysAmount = await this.masterClient.exists(
      ns_keys.map(([ns, key]) => ns_key(ns, key)),
    );
    return foundKeysAmount === ns_keys.length;
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
