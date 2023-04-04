export * from './redisMaster.service.di';
export * from './redisReplica.service.di';
export * from './redisSessions.service.di';

export const DI_MASTER_REDIS_CLIENT = 'DI_MASTER_REDIS_CLIENT_PROVIDER';

export const DI_REPLICA_REDIS_CLIENT = 'DI_REPLICA_REDIS_CLIENT_PROVIDER';

export const DI_MASTER_WITH_REPLICAS_REDIS_CLIENTS_CONFIG =
  'DI_MASTER_WITH_REPLICAS_REDIS_CLIENTS_CONFIG_PROVIDER';
