import type { ValidatorConstraintInterface } from 'class-validator';
import { IsString, Validate, ValidatorConstraint } from 'class-validator';
import { combineDecorators } from '../combineDecorators';

@ValidatorConstraint()
class PortLikeNumericString implements ValidatorConstraintInterface {
  // eslint-disable-next-line class-methods-use-this
  validate(probablyPort: string): boolean {
    if (!probablyPort) return false;
    const x = parseInt(probablyPort, 10);
    return (
      !Number.isNaN(x) && x.toString() === probablyPort && x >= 1 && x <= 65535
    );
  }
}

export function IsPortLikeNumericString(): PropertyDecorator {
  return combineDecorators(
    IsString(),
    Validate(PortLikeNumericString, [], {
      message: 'Is not port-like numeric string',
    }),
  );
}
