import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as model from './model';
import * as repo from './repo';

const entities = Object.values(model);
const repositories = Object.values(repo);

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities,
        synchronize: configService.get('database.synchronize'),
        migrationsTableName: configService.get('database.migrationsTableName'),
        migrations: configService.get('database.migrations'),
        migrationsRun: configService.get('database.migrationsRun'),
        cli: configService.get('database.cli'),
        logging: configService.get('database.typeormLoggingMode'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...repositories],
  exports: [...repositories],
})
export class InfrastructureModule {}
