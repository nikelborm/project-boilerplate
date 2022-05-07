import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig, dbConfig } from './config';
import { AccessLogMiddleware } from './tools';
import * as MockServices from './mock';

import { InfrastructureModule, UserModule } from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [appConfig, dbConfig],
    }),

    InfrastructureModule,
    UserModule,
  ],
  providers: [...Object.values(MockServices)],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLogMiddleware).forRoutes('*');
  }
}
