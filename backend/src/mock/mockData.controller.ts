import { Get, Query } from '@nestjs/common';
import { MockDataUseCase } from './mockData.useCase';
import { EmptyResponseDTO } from 'src/types';
import { ApiController, DevelopmentOnly } from 'src/tools';

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
