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

  async getOneById(id: number): Promise<AccessScope> {
    const accessScope = await this.repo.findOne({ where: { id } });
    if (!accessScope)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'accessScope'),
      );
    return accessScope;
  }

  async updateOneWithRelations(
    updatedAccessScope: UpdatedEntity<AccessScope>,
  ): Promise<AccessScope> {
    return await updateOneWithRelations(
      this.repo,
      updatedAccessScope,
      'accessScope',
    );
  }

  async createOneWithRelations(
    newAccessScope: NewEntity<AccessScope>,
  ): Promise<AccessScope> {
    return await createOneWithRelations(
      this.repo,
      newAccessScope,
      'accessScope',
    );
  }

  async deleteMany(accessScopeIds: number[]): Promise<void> {
    await this.repo.delete(accessScopeIds);
  }
}
