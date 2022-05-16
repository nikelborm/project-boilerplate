import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import {
  createManyWithRelations,
  createOneWithRelations,
  NewEntity,
  PlainEntityWithoutId,
  UpdatedEntity,
  updateOnePlain,
  updateOneWithRelations,
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

  getAll(): Promise<User[]> {
    return this.repo.find();
  }

  findManyWithAccessScopes(search?: string): Promise<User[]> {
    return this.repo.find({
      where: search
        ? [
            { firstName: ILike(`%${search}%`) },
            { lastName: ILike(`%${search}%`) },
            { email: ILike(`%${search}%`) },
          ]
        : void 0,
      relations: ['accessScopes'],
    });
  }

  async getOneByIdWithAccessScopes(id: number): Promise<UserAuthInfo> {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['accessScopes'],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
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

  async createOneWithRelations(newUser: NewEntity<User>): Promise<User> {
    return await createOneWithRelations(this.repo, newUser, 'user');
  }

  async createManyWithRelations(newUsers: NewEntity<User>[]): Promise<User[]> {
    return await createManyWithRelations(this.repo, newUsers, 'user');
  }

  async updateOnePlain(
    id: number,
    updated: PlainEntityWithoutId<User>,
  ): Promise<void> {
    return await updateOnePlain(this.repo, id, updated, 'user');
  }

  async updateOneWithRelations(newUser: UpdatedEntity<User>): Promise<User> {
    return await updateOneWithRelations(this.repo, newUser, 'user');
  }

  async findOneByEmailWithAccessScopesAndPassword(
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
        'user.salt',
        'user.passwordHash',
        'accessScopes.id',
        'accessScopes.type',
      ])
      .where('email = :email', { email })
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
