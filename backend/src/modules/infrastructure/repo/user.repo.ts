import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import {
  CreatedEntity,
  createManyWithRelations,
  createOneWithRelations,
  NewEntity,
  UpdateEntity,
  updateOnePlain,
  updateOneWithRelations,
  UpdatePlainEntity,
} from 'src/tools';
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

  async findMany(search?: string): Promise<User[]> {
    return await this.repo.find({
      where: search
        ? [
            { firstName: ILike(`%${search}%`) },
            { lastName: ILike(`%${search}%`) },
            { email: ILike(`%${search}%`) },
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

  async getOneById(id: number): Promise<User> {
    const user = await this.repo.findOne({
      where: { id },
    });
    if (!user)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'user'),
      );
    return user;
  }

  async getOneByEmail(userEmail: string): Promise<User | null> {
    return await this.repo.findOne({ where: { email: userEmail } });
  }

  async findOneByName(
    firstName: string,
    lastName: string,
  ): Promise<User | null> {
    return await this.repo.findOne({ where: { firstName, lastName } });
  }

  async updateOneWithRelations(
    updatedUser: UpdateEntity<User, 'id'>,
  ): Promise<User> {
    return await updateOneWithRelations<User, 'id'>(this.repo, updatedUser);
  }

  async createOneWithRelations(
    newUser: NewEntity<User, 'id'>,
  ): Promise<CreatedEntity<User, 'id'>> {
    return await createOneWithRelations(this.repo, newUser);
  }

  async createManyWithRelations(
    newUsers: NewEntity<User, 'id'>[],
  ): Promise<CreatedEntity<User, 'id'>[]> {
    return await createManyWithRelations(this.repo, newUsers);
  }

  async updateOnePlain(
    updatedUser: UpdatePlainEntity<User, 'id'>,
  ): Promise<void> {
    return await updateOnePlain<User, 'id'>(this.repo, updatedUser);
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
        messages.repo.user.cantGetNotFoundBy(email),
      );
    return user;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
