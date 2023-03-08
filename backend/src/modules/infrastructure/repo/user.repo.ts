import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import { insertManyPlain, insertOnePlain } from 'src/tools';
import { UserAuthInfo, UserForLoginAttemptValidation } from 'src/types';
import { ILike, Repository } from 'typeorm';
import { User } from '../model';

@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async getAll(): Promise<User[]> {
    return await this.repo.find();
  }

  async findMany(
    partOfNameOrEmail?: string,
  ): Promise<Pick<User, UsuallyReturnedUserPlainKeys>[]> {
    return await this.repo.find({
      where: partOfNameOrEmail
        ? [
            { firstName: ILike(`%${partOfNameOrEmail}%`) },
            { lastName: ILike(`%${partOfNameOrEmail}%`) },
            { email: ILike(`%${partOfNameOrEmail}%`) },
            { nickname: ILike(`%${partOfNameOrEmail}%`) },
          ]
        : void 0,
    });
  }

  async getOneByIdWithAccessScopes(id: number): Promise<UserAuthInfo> {
    const user = await this.repo.findOne({
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
    if (!user)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'user'),
      );
    return user;
  }

  async getOneById(
    id: number,
  ): Promise<Pick<User, UsuallyReturnedUserPlainKeys>> {
    const user = await this.repo.findOne({
      where: { id },
    });
    if (!user)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'user'),
      );
    return user;
  }

  async findOneByExactEmail(
    userEmail: string,
  ): Promise<Pick<User, UsuallyReturnedUserPlainKeys> | null> {
    return await this.repo.findOne({ where: { email: userEmail } });
  }

  async findOneByExactName(
    firstName: string,
    lastName: string,
  ): Promise<Pick<User, UsuallyReturnedUserPlainKeys> | null> {
    return await this.repo.findOne({ where: { firstName, lastName } });
  }

  async createOnePlain(
    newUser: Pick<User, PlainKeysAllowedToModify>,
  ): Promise<CreatedOnePlainUser> {
    return await insertOnePlain<CreatedOnePlainUser>(this.repo, newUser);
  }

  async updateOnePlain({
    id,
    ...existingUser
  }: Pick<User, PrimaryKeys | PlainKeysAllowedToModify>): Promise<
    Pick<User, PrimaryKeys | PlainKeysAllowedToModify>
  > {
    const updatedUser = await this.repo.update(id, existingUser);
    console.log('updatedUser: ', updatedUser);
    updatedUser;
    return {} as any;
  }

  async updateManyPlain(
    existingUsers: Pick<User, PlainKeysAllowedToModify>[],
  ): Promise<Pick<User, PrimaryKeys | PlainKeysAllowedToModify>[]> {
    const updatedUsers = await this.repo.save(existingUsers);
    console.log('updatedUsers: ', updatedUsers);
    updatedUsers;
    return {} as any;
  }

  async findOneByEmailWithAccessScopesAndPasswordHash(
    email: string,
  ): Promise<UserForLoginAttemptValidation> {
    const user = await this.repo
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
    if (!user)
      throw new BadRequestException(
        messages.user.cantGetNotFoundByEmail(email),
      );
    return user;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

type PrimaryKeys = 'id';
type PlainKeysGeneratedAfterInsert = PrimaryKeys | 'createdAt' | 'updatedAt';

type PlainKeysAllowedToModify = RegularPlainKeys | 'salt' | 'passwordHash';

export type UsuallyReturnedUserPlainKeys =
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

type CreatedOnePlainUser = Pick<
  User,
  PlainKeysAllowedToModify | PlainKeysGeneratedAfterInsert
>;
