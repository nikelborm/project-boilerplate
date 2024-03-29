import type { Provider } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultEntityWithIdentityRepoImplementation } from 'src/tools';
import { Repository } from 'typeorm';
import { DI_UserToAccessScopeRepo } from '../di';
import type { RepoTypes } from '../di/userToAccessScope.repo.di';
import { UserToAccessScope } from '../model';

@Injectable()
class UserToAccessScopeRepo
  extends DefaultEntityWithIdentityRepoImplementation<RepoTypes>
  implements DI_UserToAccessScopeRepo
{
  constructor(
    @InjectRepository(UserToAccessScope)
    protected override readonly repo: Repository<UserToAccessScope>,
  ) {
    super(repo);
  }
}

export const UserToAccessScopeRepoDIProvider: Provider = {
  provide: DI_UserToAccessScopeRepo,
  useClass: UserToAccessScopeRepo,
};
