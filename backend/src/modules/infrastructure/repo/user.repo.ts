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
import { Repository } from 'typeorm';
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

  async delete(id: number) {
    await this.repo.delete(id);
  }
}
