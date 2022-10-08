import { Injectable } from '@nestjs/common';
import { mockUseCaseMethodsAllowedToBeExecuted } from 'src/config';
import { AccessScopeUseCase, repo, UserUseCase } from 'src/modules';
import { AccessScopeType } from 'src/types';

@Injectable()
export class MockDataUseCase {
  constructor(
    private readonly userUseCase: UserUseCase,
    private readonly accessScopeUseCase: AccessScopeUseCase,
    private readonly accessScopeRepo: repo.AccessScopeRepo,
  ) {}

  async executeMock(scriptName?: string): Promise<void> {
    if (!scriptName)
      throw new Error(
        `Method name (mock/execute?mockScriptName=) of MockDataUseCase name was not specified`,
      );

    if (!mockUseCaseMethodsAllowedToBeExecuted.has(scriptName))
      throw new Error(
        `'${scriptName}' was not found in allowed method names of MockDataUseCase to be executed`,
      );

    console.log(`\n\n\nFILLING STARTED: ${scriptName}\n`);

    await this[scriptName]();

    console.log('\nDATABASE FILLED SUCCESSFULLY\n\n\n');
  }

  async fillDBScript(): Promise<void> {
    console.log('fillDBScript called');

    const systemAdminScope = await this.accessScopeRepo.createOneWithRelations({
      type: AccessScopeType.SYSTEM_ADMIN,
    });

    const defaultUser = await this.userUseCase.createUser({
      email: 'asd@asd.asd',
      lastName: 'Такой-тов',
      firstName: 'Такой-то',
      patronymic: 'Такой-тович',
      gender: 'male',
      password: 'asdasdasd',
    });

    await this.accessScopeRepo.updateOneWithRelations({
      id: systemAdminScope.id,
      userToAccessScopeRelations: [
        {
          userId: defaultUser.id,
        },
      ],
    });
  }
}
