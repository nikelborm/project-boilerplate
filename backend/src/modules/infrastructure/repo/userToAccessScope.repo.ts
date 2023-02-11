import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserToAccessScope } from '../model';

@Injectable()
export class UserToAccessScopeRepo {
  constructor(
    @InjectRepository(UserToAccessScope)
    private readonly repo: Repository<UserToAccessScope>,
  ) {}

  async createOne(newUserToAccessScope: {
    userId: number;
    accessScopeId: number;
  }): Promise<void> {
    await this.repo.insert(newUserToAccessScope);
  }
}
