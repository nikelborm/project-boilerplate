import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import { Repository } from 'typeorm';
import { AccessScope, User, UserToAccessScope } from '../model';

@Injectable()
export class AccessScopeRepo {
  constructor(
    @InjectRepository(AccessScope)
    private readonly repo: Repository<AccessScope>,
  ) {}

  async getOneById(
    id: number,
  ): Promise<Pick<AccessScope, 'id' | 'type' | 'createdAt' | 'updatedAt'>> {
    const accessScope = await this.repo.findOne({ where: { id } });
    if (!accessScope)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'accessScope'),
      );
    return accessScope;
  }

  async updateOneWithRelations({
    id,
    usersWithThatAccessScope,
  }: Pick<AccessScope, 'id'> & {
    usersWithThatAccessScope?: Pick<User, 'id'>[];
  }): Promise<CreatedAccessScopeWithRelations> {
    const accessScopeToSave = new AccessScope();

    accessScopeToSave.id = id;
    if (usersWithThatAccessScope)
      accessScopeToSave.userToAccessScopeRelations =
        usersWithThatAccessScope.map(({ id: userId }) => {
          const relation = new UserToAccessScope();
          relation.accessScopeId = id;
          relation.userId = userId;
          return relation;
        });

    return await this.repo.save(accessScopeToSave);
  }

  async createOneWithRelations({
    type,
    usersWithThatAccessScope,
  }: Pick<AccessScope, 'type'> & {
    usersWithThatAccessScope?: Pick<User, 'id'>[];
  }): Promise<CreatedAccessScopeWithRelations> {
    const accessScopeToSave = new AccessScope();

    accessScopeToSave.type = type;
    if (usersWithThatAccessScope)
      accessScopeToSave.userToAccessScopeRelations =
        usersWithThatAccessScope.map(({ id: userId }) => {
          const relation = new UserToAccessScope();
          relation.userId = userId;
          return relation;
        });

    return await this.repo.save(accessScopeToSave);
  }

  async deleteMany(accessScopeIds: number[]): Promise<void> {
    await this.repo.delete(accessScopeIds);
  }
}

type PlainKeysGeneratedAfterInsert = 'id' | 'createdAt' | 'updatedAt';

type CreatedAccessScopeWithRelations = Pick<
  AccessScope,
  'type' | PlainKeysGeneratedAfterInsert
> & {
  userToAccessScopeRelations: Pick<
    UserToAccessScope,
    'accessScopeId' | 'userId'
  >[];
};
