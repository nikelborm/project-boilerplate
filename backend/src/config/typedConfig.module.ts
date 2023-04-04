import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appInitConfig,
  redisConfig,
  dbConfig,
  secretConfig,
} from './configBuilders';
import { DI_TypedConfigService } from './di';
import { validateEntireConfig } from './tools/validateEntireConfig';
import { TypedConfigServiceProvider } from './typedConfig.service';

// TODO: move to https://github.com/Nikaple/nest-typed-config/tree/main which is far better
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [appInitConfig, dbConfig, redisConfig, secretConfig],
      validate: validateEntireConfig,
    }),
  ],
  providers: [TypedConfigServiceProvider],
  exports: [DI_TypedConfigService],
})
export class TypedConfigModule {}
