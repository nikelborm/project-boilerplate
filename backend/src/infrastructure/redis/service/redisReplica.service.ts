import { Inject, Injectable, Provider } from '@nestjs/common';
import { DI_RedisReplicaService, DI_REPLICA_REDIS_CLIENT } from '../di';
import { RedisReplicaClient } from '../types';

@Injectable()
class RedisReplicaService implements DI_RedisReplicaService {
  constructor(
    @Inject(DI_REPLICA_REDIS_CLIENT)
    private readonly replicaClient: RedisReplicaClient,
  ) {
    console.log('replicaClient: ', this.replicaClient);
  }
}

export const RedisReplicaServiceProvider: Provider = {
  provide: DI_RedisReplicaService,
  useClass: RedisReplicaService,
};
