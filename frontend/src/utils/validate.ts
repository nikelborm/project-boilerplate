import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

const validateConfig = {
  validationError: {
    target: false,
  },
  stopAtFirstError: true,
  whitelist: true,
  forbidNonWhitelisted: true,
};

export function validate<P>(
  payload: P,
  payloadClass: { new (): P },
): ValidationError[] {
  const payloadInstance = plainToInstance(payloadClass, payload);
  // eslint-disable-next-line no-console
  console.log('payloadInstance: ', payloadInstance);
  return validateSync(payloadInstance as any, validateConfig);
}
