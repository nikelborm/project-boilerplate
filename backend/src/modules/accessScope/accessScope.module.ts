import { Module } from '@nestjs/common';
import { AccessScopeController } from './accessScope.controller';
import { AccessScopeUseCase } from './accessScope.useCase';

@Module({
  providers: [AccessScopeUseCase],
  controllers: [AccessScopeController],
  exports: [AccessScopeUseCase],
})
export class AccessScopeModule {}
