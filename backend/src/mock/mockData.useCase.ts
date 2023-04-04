import { BadRequestException, Injectable } from '@nestjs/common';
import { assertMockScriptNameIsCorrect } from 'src/tools';
import {
  DI_UserUseCase,
  DI_UserToAccessScopeRepo,
  DI_AccessScopeRepo,
} from 'src';
import { AccessScopeType } from 'src/types';

@Injectable()
export class MockDataUseCase {
  constructor(
    private readonly userUseCase: DI_UserUseCase,
    private readonly userToAccessScopeRepo: DI_UserToAccessScopeRepo,
    private readonly accessScopeRepo: DI_AccessScopeRepo,
  ) {}

  async executeMock(scriptName?: string): Promise<void> {
    try {
      assertMockScriptNameIsCorrect(scriptName);
    } catch (error) {
      if (error instanceof Error)
        throw new BadRequestException(error.message, { cause: error });
      else throw error;
    }

    console.log(`\n\n\nFILLING STARTED: ${scriptName}\n`);

    // eslint-disable-next-line security/detect-object-injection
    await this[scriptName]();

    console.log('\nDATABASE FILLED SUCCESSFULLY\n\n\n');
  }

  async mockUserAndAdminAccessScope(): Promise<void> {
    console.log('mockUserAndAdminAccessScope called');

    const systemAdminScope = await this.accessScopeRepo.createOnePlain({
      type: AccessScopeType.SYSTEM_ADMIN,
    });
    console.log('systemAdminScope: ', systemAdminScope);

    const user = await this.userUseCase.createUser({
      email: 'asd@asd.asd',
      lastName: 'Такой-тов',
      firstName: 'Такой-то',
      nickname: 'asdasdasd',
      avatarURL: 'https://google.com',
      gender: 'male',
      patronymic: 'Такой-тович',
      password: 'asdasdasd',
    });

    console.log('user: ', user);
    const userToAccessScope = await this.userToAccessScopeRepo.createOnePlain({
      accessScopeId: systemAdminScope.id,
      userId: user.id,
    });
    console.log('userToAccessScope: ', userToAccessScope);
  }
}
