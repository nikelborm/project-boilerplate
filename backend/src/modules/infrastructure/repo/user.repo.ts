import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createManyPlain,
  createOnePlain,
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

  createOnePlain = createOnePlain(this.repo)<RepoTypes['Config']>();
  createManyPlain = createManyPlain(this.repo)<RepoTypes['Config']>();
  updateManyPlain = updateManyPlain(this.repo)<RepoTypes['Config']>();
  updateOnePlain = updateOnePlain(this.repo)<RepoTypes['Config']>();
  updateManyWithRelations = updateManyWithRelations(this.repo)<
    RepoTypes['Config']
  >();
  updateOneWithRelations = updateOneWithRelations(this.repo)<
    RepoTypes['Config']
  >();

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

type RepoTypes = EntityRepoMethodTypes<
  User,
  {
    EntityName: 'User';
    OptionalToCreateRegularPlainKeys: 'avatarURL' | 'phone';
    RequiredToCreateRegularPlainKeys:
      | 'firstName'
      | 'lastName'
      | 'nickname'
      | 'email'
      | 'patronymic'
      | 'gender'
      | 'salt'
      | 'passwordHash';

    ForbiddenToCreateGeneratedPlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdatePlainKeys: 'id' | 'createdAt' | 'updatedAt';
    ForbiddenToUpdateRelationKeys: null;
    UnselectedByDefaultPlainKeys: 'salt' | 'passwordHash';
  }
>;

export type SelectedOnePlainUser = RepoTypes['SelectedOnePlainEntity'];
