import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultEntityWithIdRepoImplementation } from 'src/tools';
import type { Repository } from 'typeorm';
import { AccessScope } from '../model';
import { DI_AccessScopeRepo, RepoTypes } from '../di/accessScope.repo.di';

@Injectable()
class AccessScopeRepo
  extends DefaultEntityWithIdRepoImplementation<RepoTypes>
  implements DI_AccessScopeRepo
{
  constructor(
    @InjectRepository(AccessScope)
    protected override readonly repo: Repository<AccessScope>,
  ) {
    super(repo);
  }
}

export const AccessScopeRepoDIProvider = {
  provide: DI_AccessScopeRepo,
  useClass: AccessScopeRepo,
};
