import type { OnModuleDestroy, OnModuleInit, Provider } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { UpdateAccessScopeDTO } from 'src/types';
import { DI_AccessScopeRepo } from '../infrastructure';
import { DI_AccessScopeUseCase } from './di/accessScope.useCase.di';

@Injectable()
class AccessScopeUseCase
  implements DI_AccessScopeUseCase, OnModuleDestroy, OnModuleInit
{
  constructor(private readonly accessScopeRepo: DI_AccessScopeRepo) {}

  async updateOne(accessScope: UpdateAccessScopeDTO): Promise<void> {
    await this.accessScopeRepo.updateOneWithRelations(accessScope);
  }

  onModuleDestroy(): void {
    // console.log('AccessScopeUseCase destroy');
  }

  onModuleInit(): void {
    // console.log('AccessScopeUseCase init');
  }
}

export const AccessScopeUseCaseProvider: Provider = {
  provide: DI_AccessScopeUseCase,
  useClass: AccessScopeUseCase,
};
