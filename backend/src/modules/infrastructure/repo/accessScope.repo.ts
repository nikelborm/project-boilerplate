import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createManyPlain,
  createOnePlain,
  updateManyPlain,
  updateOnePlain,
  updateOneWithRelations,
} from 'src/tools';
import type { EntityRepoMethodTypes } from 'src/types';
import { Repository } from 'typeorm';
import { AccessScope } from '../model';

@Injectable()
export class AccessScopeRepo {
  constructor(
    @InjectRepository(AccessScope)
    private readonly repo: Repository<AccessScope>,
  ) {}

  async getOneById(
    id: number,
  ): Promise<Pick<
    AccessScope,
    'id' | 'type' | 'createdAt' | 'updatedAt'
  > | null> {
    return await this.repo.findOne({ where: { id } });
  }

  updateOneWithRelations = updateOneWithRelations(this.repo)<
    RepoTypes['Config']
  >();

  updateManyPlain = updateManyPlain(this.repo)<RepoTypes['Config']>();

  updateOnePlain = updateOnePlain(this.repo)<RepoTypes['Config']>();

  createOnePlain = createOnePlain(this.repo)<RepoTypes['Config']>();

  createManyPlain = createManyPlain(this.repo)<RepoTypes['Config']>();

  async deleteMany(accessScopeIds: number[]): Promise<void> {
    await this.repo.delete(accessScopeIds);
  }
}

type RepoTypes = EntityRepoMethodTypes<
  AccessScope,
  {
    EntityName: 'AccessScope';
    RequiredToCreateRegularPlainKeys: 'type';
    OptionalToCreateRegularPlainKeys: null;

    ForbiddenToCreateGeneratedPlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdatePlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdateRelationKeys: null;

    UnselectedByDefaultPlainKeys: null;
  }
>;
