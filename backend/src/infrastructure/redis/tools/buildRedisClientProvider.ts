import type { InjectionToken, Provider } from '@nestjs/common';
import { createClient } from 'redis';
import { DI_MASTER_WITH_REPLICAS_REDIS_CLIENTS_CONFIG } from '../di';
import type { RedisModuleInitOptions } from '../types';

export const buildRedisClientProvider = ({
  provide,
  clientKey,
}: {
  provide: InjectionToken;
  clientKey: keyof RedisModuleInitOptions;
}): Provider => ({
  provide,
  inject: [DI_MASTER_WITH_REPLICAS_REDIS_CLIENTS_CONFIG],
  async useFactory(
    masterWithReplicasRedisClientsConfig: RedisModuleInitOptions,
  ): Promise<ReturnType<typeof createClient>> {
    const {
      [clientKey]: {
        connectionOptions: { host, password, port },
        onReady,
      },
    } = masterWithReplicasRedisClientsConfig;

    const client = createClient({
      socket: {
        host,
        port,
      },
      password,
    });
    await client.connect();

    if (onReady) await onReady(client);

    return client;
  },
});
