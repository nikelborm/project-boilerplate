import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  IsArray,
  IsDefined,
  IsString,
  Validate,
  ValidatorConstraint,
  isURL,
} from 'class-validator';
import type { IsURLOptions } from 'validator/lib/isURL';
import { combineDecorators } from '../combineDecorators';

@ValidatorConstraint()
class UrlArray implements ValidatorConstraintInterface {
  // eslint-disable-next-line class-methods-use-this
  validate(
    urlArray: string[],
    validationArguments: ValidationArguments,
  ): boolean {
    return urlArray.every((possiblyUrl) => {
      try {
        // TODO: remove this shit when bug with localhost will be fixed https://github.com/validatorjs/validator.js/issues/2213
        const url = new URL(possiblyUrl);
        if (url.hostname === 'localhost') return true;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return isURL(possiblyUrl, validationArguments.constraints[0]);
      } catch (error) {
        return false;
      }
    });
  }
}

export function IsArrayOfURLs(options: IsURLOptions = {}): PropertyDecorator {
  return combineDecorators(
    IsDefined(),
    IsArray(),
    IsString({ each: true }),
    Validate(UrlArray, [options], {
      message: 'Is not url array',
    }),
  );
}
