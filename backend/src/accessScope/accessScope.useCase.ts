import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { UpdateAccessScopeDTO } from 'src/types';
import { DI_AccessScopeRepo } from '../infrastructure';

@Injectable()
export class AccessScopeUseCase implements OnModuleDestroy, OnModuleInit {
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
