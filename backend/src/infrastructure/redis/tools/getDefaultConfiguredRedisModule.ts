import { DynamicModule } from '@nestjs/common';
import {
  ConfigKeys,
  DI_TypedConfigService,
  IRedisConfigMap,
  TypedConfigModule,
} from 'src/config';
import { RedisModule } from '../redis.module';

export function getDefaultConfiguredRedisModule(): Promise<DynamicModule> {
  return RedisModule.registerAsync({
    imports: [TypedConfigModule],
    inject: [DI_TypedConfigService],
    useFactory: (configService: DI_TypedConfigService<IRedisConfigMap>) => ({
      master: {
        connectionOptions: {
          host: configService.get(ConfigKeys.REDIS_MASTER_HOST),
          port: configService.get(ConfigKeys.REDIS_MASTER_PORT),
          password: configService.get(ConfigKeys.REDIS_MASTER_PASSWORD),
        },
      },
      replicas: {
        connectionOptions: {
          host: configService.get(ConfigKeys.REDIS_REPLICA_HOST),
          port: configService.get(ConfigKeys.REDIS_REPLICA_PORT),
          password: configService.get(ConfigKeys.REDIS_REPLICA_PASSWORD),
        },
      },
    }),
  });
}
