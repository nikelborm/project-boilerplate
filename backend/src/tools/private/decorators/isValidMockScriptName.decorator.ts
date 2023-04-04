import type { ValidatorConstraintInterface } from 'class-validator';
import { IsString, Validate, ValidatorConstraint } from 'class-validator';
import { combineDecorators } from '../../shared/combineDecorators';
import type { ConfigKeys, IAppInitConfigMap } from '../../../config/types';
import { mockUseCaseMethodsAllowedToBeExecuted } from '../../../config/mockUseCaseMethodsAllowedToBeExecuted';

export function assertMockScriptNameIsCorrect(
  scriptName?: unknown,
): asserts scriptName is IAppInitConfigMap[ConfigKeys.MOCK_SCRIPT_NAME] {
  if (!scriptName || typeof scriptName !== 'string')
    throw new Error(
      'Method name (mock/execute?mockScriptName=) of MockDataUseCase name was not specified',
    );

  if (!mockUseCaseMethodsAllowedToBeExecuted.has(scriptName))
    throw new Error(
      `'${scriptName}' was not found in allowed method names of MockDataUseCase to be executed`,
    );
}

@ValidatorConstraint()
class ValidMockScriptName implements ValidatorConstraintInterface {
  // eslint-disable-next-line class-methods-use-this
  validate(probablyMockScriptName: unknown): boolean {
    try {
      assertMockScriptNameIsCorrect(probablyMockScriptName);
      return true;
    } catch (error) {
      console.log('error: ', error);
      return false;
    }
  }
}

export function IsValidMockScriptName(): PropertyDecorator {
  return combineDecorators(
    IsString(),
    Validate(ValidMockScriptName, [], {
      message: 'Is not valid mock script name',
    }),
  );
}
