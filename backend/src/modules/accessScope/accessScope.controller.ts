import { Post } from '@nestjs/common';
import {
  AccessEnum,
  AllowedFor,
  ApiController,
  ValidatedBody,
} from 'src/tools';
import { EmptyResponseDTO, UpdateAccessScopeDTO } from 'src/types';
import { AccessScopeUseCase } from './accessScope.useCase';

@ApiController('accessScope')
export class AccessScopeController {
  constructor(private readonly accessScopeUseCase: AccessScopeUseCase) {}

  @Post('updateAccessScope')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async updateAccessScope(
    @ValidatedBody()
    accessScope: UpdateAccessScopeDTO,
  ): Promise<EmptyResponseDTO> {
    await this.accessScopeUseCase.updateOne(accessScope);
    return { response: {} };
  }
}
