import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { insertManyPlain, insertOnePlain } from 'src/tools';
import type { UserAuthInfo, UserForLoginAttemptValidation } from 'src/types';
import { ILike, Repository } from 'typeorm';
import { User } from '../model';

@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async getAll(): Promise<SelectedOnePlainUser[]> {
    return await this.repo.find();
  }

  async findMany(partOfNameOrEmail?: string): Promise<SelectedOnePlainUser[]> {
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

  async findOneById(id: number): Promise<SelectedOnePlainUser | null> {
    return await this.repo.findOne({
      where: { id },
    });
  }

  async findOneByExactEmail(
    userEmail: string,
  ): Promise<SelectedOnePlainUser | null> {
    return await this.repo.findOne({ where: { email: userEmail } });
  }

  async findOneByExactName(
    firstName: string,
    lastName: string,
  ): Promise<SelectedOnePlainUser | null> {
    return await this.repo.findOne({ where: { firstName, lastName } });
  }

  async createOnePlain(
    newUser: Pick<User, PlainKeysAllowedToModify>,
  ): Promise<CreatedOnePlainUser> {
    return await insertOnePlain<CreatedOnePlainUser>(this.repo, newUser);
  }

  async createManyPlain(
    newUsers: Pick<User, PlainKeysAllowedToModify>[],
  ): Promise<CreatedOnePlainUser[]> {
    return await insertManyPlain<CreatedOnePlainUser>(this.repo, newUsers);
  }

  async updateOnePlain({
    id,
    ...existingUser
  }: UpdatedOnePlainUser): Promise<UpdatedOnePlainUser> {
    await this.repo.update(id, existingUser);
    return { id, ...existingUser };
  }

  async updateManyPlain(
    existingUsers: UpdatedOnePlainUser[],
  ): Promise<UpdatedOnePlainUser[]> {
    const updatedUsers = await this.repo.save(existingUsers);
    return updatedUsers;
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

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

type PrimaryKeys = 'id';
type PlainKeysGeneratedAfterInsert = PrimaryKeys | 'createdAt' | 'updatedAt';

type PlainKeysAllowedToModify = RegularPlainKeys | 'salt' | 'passwordHash';

type UsuallyReturnedUserPlainKeys =
  | PlainKeysGeneratedAfterInsert
  | RegularPlainKeys;

type RegularPlainKeys =
  | 'firstName'
  | 'lastName'
  | 'nickname'
  | 'email'
  | 'avatarURL'
  | 'patronymic'
  | 'gender'
  | 'phone';

export type CreatedOnePlainUser = Pick<
  User,
  PlainKeysAllowedToModify | PlainKeysGeneratedAfterInsert
>;

export type UpdatedOnePlainUser = Pick<User, PrimaryKeys> &
  Partial<Pick<User, PlainKeysAllowedToModify>>;

export type SelectedOnePlainUser = Pick<User, UsuallyReturnedUserPlainKeys>;
