import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessScopeUseCase } from './accessScope.useCase';
import { EmptyResponseDTO, UpdateAccessScopeDTO } from 'src/types';
import { AccessEnum, AllowedFor, ValidatedBody } from 'src/tools';

@ApiTags('accessScope')
@Controller()
export class AccessScopeController {
  constructor(private readonly accessScopeUseCase: AccessScopeUseCase) {}

  @Post('updateAccessScope')
  @AllowedFor(AccessEnum.SYSTEM_ADMIN)
  async updateAccessScope(
    @ValidatedBody
    accessScope: UpdateAccessScopeDTO,
  ): Promise<EmptyResponseDTO> {
    await this.accessScopeUseCase.updateOne(accessScope);
    return { response: {} };
  }
}
