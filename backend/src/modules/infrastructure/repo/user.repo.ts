import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createManyPlain,
  createOnePlain,
  deleteEntityByIdentity,
  findOnePlainByIdentity,
  getAllEntities,
  updateManyPlain,
  updateManyWithRelations,
  updateOnePlain,
  updateOneWithRelations,
} from 'src/tools';
import type {
  EntityRepoMethodTypes,
  UserAuthInfo,
  UserForLoginAttemptValidation,
} from 'src/types';
import { ILike, Repository } from 'typeorm';
import { User } from '../model';

@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  getAll = getAllEntities(this.repo)<Config>();

  findOneById = async (
    id: number,
  ): Promise<RepoTypes['SelectedOnePlainEntity'] | null> =>
    await findOnePlainByIdentity(this.repo)<Config>()({ id });

  async findMany(
    partOfNameOrEmail?: string,
  ): Promise<RepoTypes['SelectedOnePlainEntity'][]> {
    return await this.repo.find({
      ...(partOfNameOrEmail && {
        where: [
          { firstName: ILike(`%${partOfNameOrEmail}%`) },
          { lastName: ILike(`%${partOfNameOrEmail}%`) },
          { email: ILike(`%${partOfNameOrEmail}%`) },
          { nickname: ILike(`%${partOfNameOrEmail}%`) },
        ],
      }),
    });
  }

  async getOneByIdWithAccessScopes(id: number): Promise<UserAuthInfo | null> {
    return await this.repo.findOne({
      where: { id },
      relations: {
        accessScopes: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        avatarURL: true,
        nickname: true,
        lastName: true,
        patronymic: true,
        gender: true,
        phone: true,
        accessScopes: {
          id: true,
          type: true,
        },
      },
    });
  }

  async findOneByExactEmail(
    userEmail: string,
  ): Promise<RepoTypes['SelectedOnePlainEntity'] | null> {
    return await this.repo.findOne({ where: { email: userEmail } });
  }

  async findOneByExactName(
    firstName: string,
    lastName: string,
  ): Promise<RepoTypes['SelectedOnePlainEntity'] | null> {
    return await this.repo.findOne({ where: { firstName, lastName } });
  }

  async findOneByEmailWithAccessScopesAndPasswordHash(
    email: string,
  ): Promise<UserForLoginAttemptValidation | null> {
    return await this.repo
      .createQueryBuilder('user')
      .leftJoin('user.accessScopes', 'accessScopes')
      .addSelect([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.patronymic',
        'user.gender',
        'user.phone',
        'user.nickname',
        'user.avatarURL',
        // 'user.telegram',
        'user.salt',
        'user.passwordHash',
        'accessScopes.id',
        'accessScopes.type',
      ])
      .where('user.email = :email', { email })
      .getOne();
  }

  createOnePlain = createOnePlain(this.repo)<Config>();
  createManyPlain = createManyPlain(this.repo)<Config>();

  updateManyPlain = updateManyPlain(this.repo)<Config>();
  updateOnePlain = updateOnePlain(this.repo)<Config>();

  updateManyWithRelations = updateManyWithRelations(this.repo)<Config>();
  updateOneWithRelations = updateOneWithRelations(this.repo)<Config>();

  deleteOneById = async (id: number): Promise<void> =>
    await deleteEntityByIdentity(this.repo)<Config>()({ id });
}

type RepoTypes = EntityRepoMethodTypes<
  User,
  {
    EntityName: 'User';
    OptionalToCreateAndSelectRegularPlainKeys: 'avatarURL' | 'phone';
    RequiredToCreateAndSelectRegularPlainKeys:
      | 'firstName'
      | 'lastName'
      | 'nickname'
      | 'email'
      | 'patronymic'
      | 'gender'
      | 'salt'
      | 'passwordHash'
      | 'createdAt'
      | 'updatedAt';

    ForbiddenToCreateGeneratedPlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdatePlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdateRelationKeys: null;
    UnselectedByDefaultPlainKeys: 'salt' | 'passwordHash';
  }
>;

type Config = RepoTypes['Config'];

export type OnePlainUserToBeCreated = RepoTypes['OnePlainEntityToBeCreated'];
export type OnePlainUserToBeUpdated = RepoTypes['OnePlainEntityToBeUpdated'];
export type OneUserWithRelationsToBeUpdated =
  RepoTypes['OneEntityWithRelationsToBeUpdated'];
export type SelectedOnePlainUser = RepoTypes['SelectedOnePlainEntity'];
