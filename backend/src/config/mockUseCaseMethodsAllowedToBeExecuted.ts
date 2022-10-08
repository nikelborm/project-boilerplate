import { ConfigKeys, IAppConfigMap } from 'src/types';

const allowedMethods: IAppConfigMap[ConfigKeys.MOCK_SCRIPT_NAME][] = [
  'fillDBScript',
];

export const mockUseCaseMethodsAllowedToBeExecuted: Set<string> = new Set(
  allowedMethods,
);
