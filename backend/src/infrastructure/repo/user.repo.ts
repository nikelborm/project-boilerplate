import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createManyPlain,
  createOnePlain,
  deleteEntityByIdentity,
  deleteManyEntitiesByIdentities,
  findOnePlainByIdentity,
  getAllEntities,
  updateManyPlain,
  updateManyWithRelations,
  updateOnePlain,
  updateOneWithRelations,
} from 'src/tools';
import type {
  AccessScopeType,
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
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'] | null> =>
    await findOnePlainByIdentity(this.repo)<Config>()({ id });

  async findMany(
    partOfNameOrEmail?: string,
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'][]> {
    return (await this.repo.find({
      ...(partOfNameOrEmail && {
        where: [
          { firstName: ILike(`%${partOfNameOrEmail}%`) },
          { lastName: ILike(`%${partOfNameOrEmail}%`) },
          { email: ILike(`%${partOfNameOrEmail}%`) },
          { nickname: ILike(`%${partOfNameOrEmail}%`) },
        ],
      }),
    })) as RepoTypes['Public']['SelectedOnePlainEntity'][];
  }

  async getOneByIdWithAccessScopes(id: number): Promise<UserAuthInfo | null> {
    return (await this.repo.findOne({
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
    })) as
      | (RepoTypes['Public']['SelectedOnePlainEntity'] & {
          accessScopes: { id: number; type: AccessScopeType }[];
        })
      | null;
  }

  async findOneByExactEmail(
    userEmail: string,
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'] | null> {
    return (await this.repo.findOne({ where: { email: userEmail } })) as
      | RepoTypes['Public']['SelectedOnePlainEntity']
      | null;
  }

  async findOneByExactName(
    firstName: string,
    lastName: string,
  ): Promise<RepoTypes['Public']['SelectedOnePlainEntity'] | null> {
    return (await this.repo.findOne({ where: { firstName, lastName } })) as
      | RepoTypes['Public']['SelectedOnePlainEntity']
      | null;
  }

  async findOneByEmailWithAccessScopesAndPasswordHash(
    email: string,
  ): Promise<UserForLoginAttemptValidation | null> {
    return (await this.repo
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
      .getOne()) as
      | (RepoTypes['Public']['SelectedOnePlainEntity'] & {
          accessScopes: { id: number; type: AccessScopeType }[];
          salt: string;
          passwordHash: string;
        })
      | null;
  }

  createOnePlain = createOnePlain(this.repo)<Config>();
  createManyPlain = createManyPlain(this.repo)<Config>();

  updateManyPlain = updateManyPlain(this.repo)<Config>();
  updateOnePlain = updateOnePlain(this.repo)<Config>();

  updateManyWithRelations = updateManyWithRelations(this.repo)<Config>();
  updateOneWithRelations = updateOneWithRelations(this.repo)<Config>();

  deleteOneById = async (id: number): Promise<void> =>
    await deleteEntityByIdentity(this.repo)<Config>()({ id });

  deleteManyByIds = async (ids: number[]): Promise<void> =>
    await deleteManyEntitiesByIdentities(this.repo)<Config>()(
      ids.map((id) => ({ id })),
    );
}

type RepoTypes = EntityRepoMethodTypes<
  User,
  {
    EntityName: 'User';
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
    OptionalToCreateAndSelectRegularPlainKeys: 'avatarURL' | 'phone';

    ForbiddenToCreateGeneratedPlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdatePlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdateRelationKeys: null;
    UnselectedByDefaultPlainKeys: 'salt' | 'passwordHash';
  }
>;

type Config = RepoTypes['Config'];
export type UserPublicRepoTypes = RepoTypes['Public'];
