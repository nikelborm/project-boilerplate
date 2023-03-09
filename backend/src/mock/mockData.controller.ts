import { Get, Query } from '@nestjs/common';
import { ApiController, DevelopmentOnly } from 'src/tools';
import type { EmptyResponseDTO } from 'src/types';
import { MockDataUseCase } from './mockData.useCase';

@ApiController('mock')
export class MockDataController {
  constructor(private readonly mockDataUseCase: MockDataUseCase) {}

  @Get('execute')
  @DevelopmentOnly()
  async executeMockScriptByName(
    @Query('mockScriptName') mockScriptName?: string,
  ): Promise<EmptyResponseDTO> {
    await this.mockDataUseCase.executeMock(mockScriptName);
    return {};
  }
}
