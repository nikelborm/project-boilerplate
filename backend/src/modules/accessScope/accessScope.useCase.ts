import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { model, repo } from '../infrastructure';
import { UpdateAccessScopeDTO } from 'src/types';

@Injectable()
export class AccessScopeUseCase implements OnModuleDestroy, OnModuleInit {
  constructor(private readonly accessScopeRepo: repo.AccessScopeRepo) {}

  async updateOne(
    accessScope: UpdateAccessScopeDTO,
  ): Promise<model.AccessScope> {
    return await this.accessScopeRepo.updateOneWithRelations(accessScope);
  }

  onModuleDestroy(): void {
    console.log('AccessScopeUseCase destroy');
  }

  onModuleInit(): void {
    console.log('AccessScopeUseCase init');
  }
}
