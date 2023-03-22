import { Module } from '@nestjs/common';
import { AccessScopeController } from './accessScope.controller';
import { AccessScopeUseCaseProvider } from './accessScope.useCase';
import { DI_AccessScopeUseCase } from './di';

@Module({
  providers: [AccessScopeUseCaseProvider],
  controllers: [AccessScopeController],
  exports: [DI_AccessScopeUseCase],
})
export class AccessScopeModule {}
