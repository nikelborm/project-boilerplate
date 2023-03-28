import { Provider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisModuleFactoryOptions, RedisModuleOptions } from '../types';

export const buildRedisClientProvider = async ({
  inject,
  useFactory,
  provide,
  clientKey,
}: RedisModuleFactoryOptions & {
  provide: string;
  clientKey: keyof RedisModuleOptions;
}): Promise<Provider> => ({
  provide,
  inject,
  async useFactory(...args): Promise<any> {
    const {
      [clientKey]: {
        connectionOptions: { host, password, port },
        onReady,
      },
    } = await useFactory(...args);

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
