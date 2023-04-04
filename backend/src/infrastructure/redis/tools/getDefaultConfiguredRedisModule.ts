import type { DynamicModule } from '@nestjs/common';
import type { IRedisConfigMap } from 'src/config';
import {
  ConfigKeys,
  DI_TypedConfigService,
  TypedConfigModule,
} from 'src/config';
import { RedisModule } from '../redis.module';

export function getDefaultConfiguredRedisModule(): DynamicModule {
  return RedisModule.registerAsync<[DI_TypedConfigService<IRedisConfigMap>]>({
    imports: [TypedConfigModule],
    inject: [DI_TypedConfigService],
    useFactory: (configService) => ({
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
