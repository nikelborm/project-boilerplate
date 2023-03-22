import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createManyPlain,
  createOnePlain,
  deleteEntityByIdentity,
  deleteManyEntitiesByIdentities,
  findManyPlainByIdentities,
  findOnePlainByIdentity,
  getAllEntities,
  updateManyPlain,
  updateManyWithRelations,
  updateOnePlain,
  updateOneWithRelations,
} from 'src/tools';
import type { EntityRepoMethodTypes } from 'src/types';
import { Repository } from 'typeorm';
import { UserToAccessScope } from '../model';

@Injectable()
export class UserToAccessScopeRepo {
  constructor(
    @InjectRepository(UserToAccessScope)
    private readonly repo: Repository<UserToAccessScope>,
  ) {}

  getAll = getAllEntities(this.repo)<Config>();

  findOneByIdentity = findOnePlainByIdentity(this.repo)<Config>();
  findManyByIdentities = findManyPlainByIdentities(this.repo)<Config>();

  createOnePlain = createOnePlain(this.repo)<Config>();
  createManyPlain = createManyPlain(this.repo)<Config>();

  updateManyPlain = updateManyPlain(this.repo)<Config>();
  updateOnePlain = updateOnePlain(this.repo)<Config>();

  updateManyWithRelations = updateManyWithRelations(this.repo)<Config>();
  updateOneWithRelations = updateOneWithRelations(this.repo)<Config>();

  deleteOne = deleteEntityByIdentity(this.repo)<Config>();
  deleteMany = deleteManyEntitiesByIdentities(this.repo)<Config>();
}

type RepoTypes = EntityRepoMethodTypes<
  UserToAccessScope,
  {
    EntityName: 'UserToAccessScope';

    RequiredToCreateAndSelectRegularPlainKeys: 'userId' | 'accessScopeId';

    OptionalToCreateAndSelectRegularPlainKeys: null;

    ForbiddenToCreateGeneratedPlainKeys: null;
    ForbiddenToUpdatePlainKeys: 'userId' | 'accessScopeId';
    ForbiddenToUpdateRelationKeys: null;
    UnselectedByDefaultPlainKeys: null;
  }
>;

type Config = RepoTypes['Config'];

export type UserToAccessScopePublicRepoTypes = RepoTypes['Public'];
