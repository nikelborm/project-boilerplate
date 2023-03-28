import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, redisConfig, dbConfig } from './configBuilders';
import { DI_TypedConfigService } from './di';
import { validateEntireConfig } from './tools/validateEntireConfig';
import { TypedConfigServiceProvider } from './typedConfig.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [appConfig, dbConfig, redisConfig],
      validate: validateEntireConfig,
    }),
  ],
  providers: [TypedConfigServiceProvider],
  exports: [DI_TypedConfigService],
})
export class TypedConfigModule {}
