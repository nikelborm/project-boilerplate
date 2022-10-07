import { Injectable } from '@nestjs/common';

@Injectable()
export class MockDataUseCase {
  async fillDBScript(): Promise<void> {
    console.log('fillDBScript called');
  }
}
