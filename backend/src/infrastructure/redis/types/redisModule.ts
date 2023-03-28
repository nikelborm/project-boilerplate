import { FactoryProvider } from '@nestjs/common';
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

export type RedisModuleOptions = {
  master: RedisClientOptions;
  replicas: RedisClientOptions;
};

export type RedisModuleFactoryOptions = {
  useFactory: (
    ...args: any[]
  ) => RedisModuleOptions | Promise<RedisModuleOptions>;
} & Pick<FactoryProvider, 'inject'>;
