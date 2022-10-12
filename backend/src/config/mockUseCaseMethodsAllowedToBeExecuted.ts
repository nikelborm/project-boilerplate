import type { IAppConfigMap } from './types';
import { ConfigKeys } from './types';

const allowedMethods: IAppConfigMap[ConfigKeys.MOCK_SCRIPT_NAME][] = [
  'fillDBScript',
];

export const mockUseCaseMethodsAllowedToBeExecuted: Set<string> = new Set(
  allowedMethods,
);
