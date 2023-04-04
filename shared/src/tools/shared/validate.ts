import { plainToInstance } from 'class-transformer';
import type { ValidationError, ValidatorOptions } from 'class-validator';
import { validateSync } from 'class-validator';

const defaultValidateConfig = {
  validationError: {
    target: false,
  },
  stopAtFirstError: true,
  whitelist: true,
  forbidNonWhitelisted: true,
} as const satisfies ValidatorOptions;

export function validate<P>(
  payload: P,
  payloadClass: { new (): P },
  optionsOverrides?: ValidatorOptions,
): { payloadInstance: P; errors: ValidationError[] } {
  const payloadInstance = plainToInstance(payloadClass, payload);
  // eslint-disable-next-line no-console
  console.log('payloadInstance: ', payloadInstance);
  return {
    payloadInstance,
    errors: validateSync(payloadInstance as object, {
      ...defaultValidateConfig,
      ...optionsOverrides,
    }),
  };
}
