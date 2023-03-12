import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createManyPlain, createOnePlain } from 'src/tools';
import type { EntityRepoMethodTypes } from 'src/types';
import { Repository } from 'typeorm';
import { UserToAccessScope } from '../model';

@Injectable()
export class UserToAccessScopeRepo {
  constructor(
    @InjectRepository(UserToAccessScope)
    private readonly repo: Repository<UserToAccessScope>,
  ) {}

  createOnePlain = createOnePlain(this.repo)<RepoTypes['Config']>();
  createManyPlain = createManyPlain(this.repo)<RepoTypes['Config']>();
}

type RepoTypes = EntityRepoMethodTypes<
  UserToAccessScope,
  {
    EntityName: 'UserToAccessScope';
    RequiredToCreateRegularPlainKeys: 'userId' | 'accessScopeId';
    OptionalToCreateRegularPlainKeys: null;

    ForbiddenToCreateGeneratedPlainKeys: null;
    ForbiddenToUpdatePlainKeys: null;
    ForbiddenToUpdateRelationKeys: null;
    UnselectedByDefaultPlainKeys: null;
  }
>;
