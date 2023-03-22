import type { IAppConfigMap, ConfigKeys } from './types';

const allowedMethods: IAppConfigMap[ConfigKeys.MOCK_SCRIPT_NAME][] = [
  'mockUserAndAdminAccessScope',
];

export const mockUseCaseMethodsAllowedToBeExecuted: Set<string> = new Set(
  allowedMethods,
);
