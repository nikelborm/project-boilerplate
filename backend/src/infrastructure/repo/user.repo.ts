import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultEntityWithIdRepoImplementation } from 'src/tools';
import type {
  AccessScopeType,
  UserAuthInfo,
  UserForLoginAttemptValidation,
} from 'src/types';
import { ILike, Repository } from 'typeorm';
import { DI_UserRepo, RepoTypes } from '../di/user.repo.di';
import { User } from '../model';

@Injectable()
class UserRepo
  extends DefaultEntityWithIdRepoImplementation<RepoTypes>
  implements DI_UserRepo
{
  constructor(
    @InjectRepository(User)
    protected override readonly repo: Repository<User>,
  ) {
    super(repo);
  }

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
}

export const UserRepoDIProvider = {
  provide: DI_UserRepo,
  useClass: UserRepo,
};
