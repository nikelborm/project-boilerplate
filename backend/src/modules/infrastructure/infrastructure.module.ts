import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as model from './model';
import * as repo from './repo';
import { ConfigKeys, IDatabaseConfigMap } from 'src/types';

const entities = Object.values(model);
const repositories = Object.values(repo);

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<IDatabaseConfigMap, true>) => ({
        type: 'postgres',
        host: configService.get(ConfigKeys.DATABASE_HOST, { infer: true }),
        port: configService.get(ConfigKeys.DATABASE_PORT, { infer: true }),
        username: configService.get(ConfigKeys.DATABASE_USERNAME, {
          infer: true,
        }),
        password: configService.get(ConfigKeys.DATABASE_PASSWORD, {
          infer: true,
        }),
        database: configService.get(ConfigKeys.DATABASE_NAME, {
          infer: true,
        }),
        entities,
        logging: configService.get(ConfigKeys.DATABASE_TYPEORM_LOGGING_MODE, {
          infer: true,
        }),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...repositories],
  exports: [...repositories],
})
export class InfrastructureModule {}
