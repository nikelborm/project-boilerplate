import { Post } from '@nestjs/common';
import {
  AccessEnum,
  AllowedFor,
  ApiController,
  ValidatedBody,
} from 'src/tools';
import type { EmptyResponseDTO } from 'src/types';
import { UpdateAccessScopeDTO } from 'src/types';
import { DI_AccessScopeUseCase } from './di';

@ApiController('accessScope')
export class AccessScopeController {
  constructor(private readonly accessScopeUseCase: DI_AccessScopeUseCase) {}

  @Post('updateAccessScope')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async updateAccessScope(
    @ValidatedBody()
    accessScope: UpdateAccessScopeDTO,
  ): Promise<EmptyResponseDTO> {
    await this.accessScopeUseCase.updateOne(accessScope);
    return {};
  }
}
