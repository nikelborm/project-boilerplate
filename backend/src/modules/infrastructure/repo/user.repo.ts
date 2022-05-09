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
import { ILike, Repository } from 'typeorm';
import { User } from '../model';

@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  getAll() {
    return this.repo.find();
  }

  findManyWithAccessScopes(search?: string) {
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

  async getOneByIdWithAccessScopes(id: number) {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['accessScopes'],
    });
    if (!user)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'user'),
      );
    return user;
  }

  async getOneById(id: number) {
    const user = await this.repo.findOne({
      where: { id },
    });
    if (!user)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'user'),
      );
    return user;
  }

  async getOneByEmail(userEmail: string) {
    return await this.repo.findOne({ where: { email: userEmail } });
  }

  async findOneByName(firstName: string, lastName: string) {
    return await this.repo.findOne({ where: { firstName, lastName } });
  }

  createOneWithRelations(newUser: NewEntity<User>) {
    return createOneWithRelations(this.repo, newUser, 'user');
  }

  createManyWithRelations(newUsers: NewEntity<User>[]) {
    return createManyWithRelations(this.repo, newUsers, 'user');
  }

  updateOnePlain(id: number, updated: PlainEntityWithoutId<User>) {
    return updateOnePlain(this.repo, id, updated, 'user');
  }

  updateOneWithRelations(newUser: UpdatedEntity<User>) {
    return updateOneWithRelations(this.repo, newUser, 'user');
  }

  findOneByEmailWithAccessScopesAndPassword(email: string) {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.accessScopes', 'accessScopes')
      .addSelect(['user.salt', 'user.passwordHash'])
      .where('LOWER(email) = LOWER(:email)', { email })
      .getOne();
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}
