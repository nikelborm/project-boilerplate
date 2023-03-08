import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { UpdateAccessScopeDTO } from 'src/types';
import { model, repo } from '../infrastructure';

@Injectable()
export class AccessScopeUseCase implements OnModuleDestroy, OnModuleInit {
  constructor(private readonly accessScopeRepo: repo.AccessScopeRepo) {}

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
