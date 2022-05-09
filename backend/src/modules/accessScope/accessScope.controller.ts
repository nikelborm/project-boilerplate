import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessScopeUseCase } from './accessScope.useCase';
import { EmptyResponseDTO, UpdateAccessScopeDTO } from 'src/types';
import { AccessEnum, AllowedFor } from '../auth';

@ApiTags('accessScope')
@Controller('/api')
export class AccessScopeController {
  constructor(private readonly accessScopeUseCase: AccessScopeUseCase) {}

  @Post('/updateAccessScope')
  @AllowedFor(AccessEnum.USER_EDIT_PERMISSIONS)
  async updateAccessScope(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    accessScope: UpdateAccessScopeDTO,
  ): Promise<EmptyResponseDTO> {
    await this.accessScopeUseCase.updateOne(accessScope);
    return { response: {} };
  }
}
