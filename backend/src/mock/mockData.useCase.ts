import { Injectable } from '@nestjs/common';

@Injectable()
export class MockDataUseCase {
  async fillDBScript() {
    console.log('fillDBScript called');
  }
}
