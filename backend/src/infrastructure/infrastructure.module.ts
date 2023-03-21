import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigKeys, IDatabaseConfigMap, TypedConfigService } from 'src/config';
import * as model from './model';
import * as repo from './repo';

const entities = Object.values(model);
const repositories = Object.values(repo);

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: TypedConfigService<IDatabaseConfigMap>) => ({
        type: 'postgres',
        host: configService.get(ConfigKeys.DATABASE_HOST),
        port: configService.get(ConfigKeys.DATABASE_PORT),
        username: configService.get(ConfigKeys.DATABASE_USERNAME),
        password: configService.get(ConfigKeys.DATABASE_PASSWORD),
        database: configService.get(ConfigKeys.DATABASE_NAME),
        entities,
        logging: configService.get(ConfigKeys.DATABASE_TYPEORM_LOGGING_MODE),
      }),
      inject: [TypedConfigService],
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...repositories],
  exports: [...repositories],
})
export class InfrastructureModule {}
