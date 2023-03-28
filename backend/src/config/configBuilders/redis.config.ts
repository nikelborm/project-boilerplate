import { ConfigKeys, type IRedisConfigMap } from '../types';

export const redisConfig: () => IRedisConfigMap = () => ({
  [ConfigKeys.REDIS_MASTER_PORT]: parseInt(
    process.env['REDIS_MASTER_PORT'] || '6379',
    10,
  ),
  [ConfigKeys.REDIS_MASTER_HOST]: process.env['REDIS_MASTER_HOST'] as string,
  [ConfigKeys.REDIS_MASTER_PASSWORD]: process.env[
    'REDIS_MASTER_PASSWORD'
  ] as string,
  [ConfigKeys.REDIS_REPLICA_PORT]: parseInt(
    process.env['REDIS_REPLICA_PORT'] || '6379',
    10,
  ),
  [ConfigKeys.REDIS_REPLICA_HOST]: process.env['REDIS_REPLICA_HOST'] as string,
  [ConfigKeys.REDIS_REPLICA_PASSWORD]: process.env[
    'REDIS_REPLICA_PASSWORD'
  ] as string,
});
