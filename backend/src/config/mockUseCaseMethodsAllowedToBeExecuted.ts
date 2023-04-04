import type { IAppInitConfigMap, ConfigKeys } from './types';

const allowedMethods: IAppInitConfigMap[ConfigKeys.MOCK_SCRIPT_NAME][] = [
  'mockUserAndAdminAccessScope',
];

export const mockUseCaseMethodsAllowedToBeExecuted = new Set(allowedMethods);
