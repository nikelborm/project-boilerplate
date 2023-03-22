import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultEntityRepoImplementation } from 'src/tools';
import { Repository } from 'typeorm';
import { DI_UserToAccessScopeRepo } from '../di';
import { RepoTypes } from '../di/userToAccessScope.repo.di';
import { UserToAccessScope } from '../model';

@Injectable()
class UserToAccessScopeRepo
  extends DefaultEntityRepoImplementation<RepoTypes>
  implements DI_UserToAccessScopeRepo
{
  constructor(
    @InjectRepository(UserToAccessScope)
    protected override readonly repo: Repository<UserToAccessScope>,
  ) {
    super(repo);
  }
}

export const UserToAccessScopeRepoDIProvider = {
  provide: DI_UserToAccessScopeRepo,
  useClass: UserToAccessScopeRepo,
};
