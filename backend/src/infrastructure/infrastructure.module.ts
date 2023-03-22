import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConfigKeys,
  IDatabaseConfigMap,
  DI_TypedConfigService,
} from 'src/config';
import { DeArray } from 'src/types';
import * as model from './model';
import * as repo from './repo';
import * as di from './di';

const entities = Object.values(model);
const DI_RepoGetters = Object.values(di);
const repoProviders = Object.values(repo).filter(
  (
    e,
  ): e is Extract<
    DeArray<(typeof repo)[keyof typeof repo]>,
    { provide: any }
  > => 'provide' in e,
);

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (
        configService: DI_TypedConfigService<IDatabaseConfigMap>,
      ) => ({
        type: 'postgres',
        host: configService.get(ConfigKeys.DATABASE_HOST),
        port: configService.get(ConfigKeys.DATABASE_PORT),
        username: configService.get(ConfigKeys.DATABASE_USERNAME),
        password: configService.get(ConfigKeys.DATABASE_PASSWORD),
        database: configService.get(ConfigKeys.DATABASE_NAME),
        entities,
        logging: configService.get(ConfigKeys.DATABASE_TYPEORM_LOGGING_MODE),
      }),
      inject: [DI_TypedConfigService],
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...repoProviders],
  exports: [...DI_RepoGetters],
})
export class InfrastructureModule {}
