import type {
  DynamicModule,
  ModuleMetadata,
  OnModuleDestroy,
} from '@nestjs/common';
import { Inject, Logger, Module } from '@nestjs/common';
import {
  DI_MASTER_REDIS_CLIENT,
  DI_MASTER_WITH_REPLICAS_REDIS_CLIENTS_CONFIG,
  DI_REPLICA_REDIS_CLIENT,
  DI_RedisMasterService,
  DI_RedisReplicaService,
  DI_RedisSessionsService,
} from './di';
import {
  RedisMasterServiceProvider,
  RedisReplicaServiceProvider,
  RedisSessionsServiceProvider,
} from './service';
import { buildRedisClientProvider } from './tools';
import { RedisMasterClient, type RedisModuleOptionsWithFactory } from './types';

@Module({})
export class RedisModule implements OnModuleDestroy {
  constructor(
    @Inject(DI_MASTER_REDIS_CLIENT)
    private readonly masterClient: RedisMasterClient,
    @Inject(DI_REPLICA_REDIS_CLIENT)
    private readonly replicaClient: RedisMasterClient,
  ) {}

  private readonly logger = new Logger(RedisModule.name);

  static registerAsync<FactoryArgs extends any[]>({
    imports,
    inject,
    useFactory,
  }: Pick<ModuleMetadata, 'imports'> &
    RedisModuleOptionsWithFactory<FactoryArgs>): DynamicModule {
    return {
      module: RedisModule,
      imports,
      providers: [
        {
          provide: DI_MASTER_WITH_REPLICAS_REDIS_CLIENTS_CONFIG,
          inject,
          useFactory,
        },
        buildRedisClientProvider({
          provide: DI_MASTER_REDIS_CLIENT,
          clientKey: 'master',
        }),
        buildRedisClientProvider({
          provide: DI_REPLICA_REDIS_CLIENT,
          clientKey: 'replicas',
        }),
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

  async onModuleDestroy(): Promise<void> {
    //? onModuleDestroy doesn't work in development, but who cares actually. Everything is fine in production
    await Promise.all([this.masterClient.quit(), this.replicaClient.quit()]);

    this.logger.log('Redis master and replica clients successfully quit');
  }
}
