import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import {
  CreatedEntity,
  createOneWithRelations,
  NewEntity,
  UpdateEntity,
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
    updatedUser: UpdateEntity<AccessScope, 'id'>,
  ): Promise<AccessScope> {
    return await updateOneWithRelations<AccessScope, 'id'>(
      this.repo,
      updatedUser,
    );
  }

  async createOneWithRelations(
    newUser: NewEntity<AccessScope, 'id'>,
  ): Promise<CreatedEntity<AccessScope, 'id'>> {
    return await createOneWithRelations(this.repo, newUser);
  }

  async deleteMany(accessScopeIds: number[]): Promise<void> {
    await this.repo.delete(accessScopeIds);
  }
}
