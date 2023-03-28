import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import {
  DI_MASTER_REDIS_CLIENT,
  DI_RedisMasterService,
  DI_RedisReplicaService,
  DI_RedisSessionsService,
  DI_REPLICA_REDIS_CLIENT,
} from './di';
import {
  RedisMasterServiceProvider,
  RedisReplicaServiceProvider,
  RedisSessionsServiceProvider,
} from './service';
import { buildRedisClientProvider } from './tools';
import { RedisModuleFactoryOptions } from './types';

@Module({})
export class RedisModule {
  static async registerAsync({
    imports,
    inject,
    useFactory,
  }: Pick<ModuleMetadata, 'imports'> &
    RedisModuleFactoryOptions): Promise<DynamicModule> {
    return {
      module: RedisModule,
      imports,
      providers: [
        ...(await Promise.all([
          buildRedisClientProvider({
            provide: DI_MASTER_REDIS_CLIENT,
            clientKey: 'master',
            useFactory,
            inject,
          }),
          buildRedisClientProvider({
            provide: DI_REPLICA_REDIS_CLIENT,
            clientKey: 'replicas',
            useFactory,
            inject,
          }),
        ])),
        RedisReplicaServiceProvider,
        RedisMasterServiceProvider,
        RedisSessionsServiceProvider,
      ],
      exports: [
        DI_RedisReplicaService,
        DI_RedisMasterService,
        DI_RedisSessionsService,
      ],
    };
  }
}
