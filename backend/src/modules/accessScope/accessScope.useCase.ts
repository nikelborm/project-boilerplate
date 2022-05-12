import {
  Injectable /* , OnModuleDestroy, OnModuleInit */,
} from '@nestjs/common';
import { repo } from '../infrastructure';
import { UpdateAccessScopeDTO } from 'src/types';

@Injectable()
export class AccessScopeUseCase /* implements OnModuleDestroy, OnModuleInit */ {
  constructor(
    private readonly accessScopeRepo: repo.AccessScopeRepo,
    private readonly userRepo: repo.UserRepo,
  ) {}

  async updateOne(accessScope: UpdateAccessScopeDTO) {
    return this.accessScopeRepo.updateOneWithRelations(accessScope);
  }
}
