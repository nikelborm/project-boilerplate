import type { ValidatorConstraintInterface } from 'class-validator';
import { IsString, Validate, ValidatorConstraint } from 'class-validator';
import { combineDecorators } from '../../shared/combineDecorators';
import type { BootstrapMode } from '../../../config/types/bootstrapMode';
import { allowedBootstrapModes } from '../../../config/allowedBootstrapModes';

export function assertBootstrapModeIsCorrect(
  bootstrapMode?: unknown,
): asserts bootstrapMode is BootstrapMode {
  if (!bootstrapMode || typeof bootstrapMode !== 'string')
    throw new Error('Bootstrap mode was not specified');

  if (!allowedBootstrapModes.has(bootstrapMode))
    throw new Error(
      `'${bootstrapMode}' was not found in allowed bootstrap modes`,
    );
}

@ValidatorConstraint()
class ValidBootstrapMode implements ValidatorConstraintInterface {
  // eslint-disable-next-line class-methods-use-this
  validate(probablyMockScriptName: unknown): boolean {
    try {
      assertBootstrapModeIsCorrect(probablyMockScriptName);
      return true;
    } catch (error) {
      console.log('error: ', error);
      return false;
    }
  }
}

export function IsValidBootstrapMode(): PropertyDecorator {
  return combineDecorators(
    IsString(),
    Validate(ValidBootstrapMode, [], {
      message: 'Is not valid bootstrap mode',
    }),
  );
}
