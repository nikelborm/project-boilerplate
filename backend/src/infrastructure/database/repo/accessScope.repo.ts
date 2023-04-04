import type { Provider } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultEntityWithIdRepoImplementation } from 'src/tools';
import { Repository } from 'typeorm';
import { AccessScope } from '../model';
import type { RepoTypes } from '../di/accessScope.repo.di';
import { DI_AccessScopeRepo } from '../di/accessScope.repo.di';

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

export const AccessScopeRepoDIProvider: Provider = {
  provide: DI_AccessScopeRepo,
  useClass: AccessScopeRepo,
};
