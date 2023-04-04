import type { MiddlewareConsumer } from '@nestjs/common';
import { Module } from '@nestjs/common';
import {
  AccessScopeModule,
  AuthModule,
  InfrastructureModule,
  UserModule,
} from '.';
import { TypedConfigModule } from './config';
import * as MockServices from './mock';
import { MockDataController } from './mock/mockData.controller';
import { AccessLogMiddleware } from './tools';

@Module({
  imports: [
    AccessScopeModule,
    AuthModule,
    InfrastructureModule,
    TypedConfigModule,
    UserModule,
  ],
  controllers: [MockDataController],
  providers: [...Object.values(MockServices)],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AccessLogMiddleware).forRoutes('*');
  }
}
