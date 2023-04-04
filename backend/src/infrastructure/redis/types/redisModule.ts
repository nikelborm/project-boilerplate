import type { FactoryProvider } from '@nestjs/common';
import { type createClient } from 'redis';

export type RedisClient = ReturnType<typeof createClient>;

export type RedisClientTransactionBuilder = ReturnType<
  ReturnType<typeof createClient>['multi']
>;

export type RedisMasterClient = RedisClient;

export type RedisReplicaClient = RedisClient;

export type RedisClientOptions = {
  connectionOptions: {
    host: string;
    port: number;
    password: string;
  };
  onReady?: (client: RedisClient) => Promise<void> | void;
};

export type RedisModuleInitOptions = {
  master: RedisClientOptions;
  replicas: RedisClientOptions;
};

export type RedisModuleFactoryFunc<FactoryArgs extends any[]> = (
  ...args: FactoryArgs
) => RedisModuleInitOptions | Promise<RedisModuleInitOptions>;

export type RedisModuleOptionsWithFactory<FactoryArgs extends any[]> = {
  useFactory: RedisModuleFactoryFunc<FactoryArgs>;
} & Pick<FactoryProvider, 'inject'>;
