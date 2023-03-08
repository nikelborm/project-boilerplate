import type { IAppConfigMap } from './types';
import { ConfigKeys } from './types';

const allowedMethods: IAppConfigMap[ConfigKeys.MOCK_SCRIPT_NAME][] = [
  'mockUserAndAdminAccessScope',
];

export const mockUseCaseMethodsAllowedToBeExecuted: Set<string> = new Set(
  allowedMethods,
);

export function assertMockScriptNameIsCorrect(
  scriptName?: string,
): asserts scriptName is IAppConfigMap[ConfigKeys.MOCK_SCRIPT_NAME] {
  if (!scriptName)
    throw new Error(
      `Method name (mock/execute?mockScriptName=) of MockDataUseCase name was not specified`,
    );

  if (!mockUseCaseMethodsAllowedToBeExecuted.has(scriptName))
    throw new Error(
      `'${scriptName}' was not found in allowed method names of MockDataUseCase to be executed`,
    );
}
