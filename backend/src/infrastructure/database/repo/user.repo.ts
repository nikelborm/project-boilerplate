import type { Provider } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultEntityWithIdRepoImplementation } from 'src/tools';
import type { AccessScopeType, UserForLoginAttemptValidation } from 'src/types';
import { ILike, Repository } from 'typeorm';
import type {
  PlainUserWithPlainAccessScopes,
  RepoTypes,
} from '../di/user.repo.di';
import { DI_UserRepo } from '../di/user.repo.di';
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

  async getOneByIdWithAccessScopes(
    id: number,
  ): Promise<PlainUserWithPlainAccessScopes | null> {
    return await this.#getOneWithAccessScopesBy({ id });
  }

  async getOneByEmailWithAccessScopes(
    email: string,
  ): Promise<PlainUserWithPlainAccessScopes | null> {
    return await this.#getOneWithAccessScopesBy({ email });
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
      .select([
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

  async #getOneWithAccessScopesBy(
    where:
      | {
          id: number;
        }
      | {
          email: string;
        },
  ): Promise<PlainUserWithPlainAccessScopes | null> {
    return (await this.repo.findOne({
      where,
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
    })) as PlainUserWithPlainAccessScopes | null;
  }
}

export const UserRepoDIProvider: Provider = {
  provide: DI_UserRepo,
  useClass: UserRepo,
};
