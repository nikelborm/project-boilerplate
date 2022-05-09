import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import {
  createOneWithRelations,
  NewEntity,
  UpdatedEntity,
  updateOneWithRelations,
} from 'src/tools';
import { Repository } from 'typeorm';
import { AccessScope } from '../model';

@Injectable()
export class AccessScopeRepo {
  constructor(
    @InjectRepository(AccessScope)
    private readonly repo: Repository<AccessScope>,
  ) {}

  async getOneById(id: number) {
    const accessScope = await this.repo.findOne({ where: { id } });
    if (!accessScope)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'accessScope'),
      );
    return accessScope;
  }

  async updateOneWithRelations(updatedAccessScope: UpdatedEntity<AccessScope>) {
    return updateOneWithRelations(this.repo, updatedAccessScope, 'accessScope');
  }

  createOneWithRelations(newAccessScope: NewEntity<AccessScope>) {
    return createOneWithRelations(this.repo, newAccessScope, 'accessScope');
  }

  deleteMany(accessScopeIds: number[]) {
    return this.repo.delete(accessScopeIds);
  }
}
