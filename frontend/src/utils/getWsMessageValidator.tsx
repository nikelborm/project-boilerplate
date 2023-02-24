import { validate } from 'utils';

export function getWsMessageValidator<T>(dto: new () => T) {
  function validateWsMessage(message: any) {
    const { errors, payloadInstance } = validate<T>(message, dto);
    if (errors.length) {
      throw new Error(
        `WS incoming message validation error: ${JSON.stringify(errors)}`
      );
    }
    return payloadInstance;
  }
  return validateWsMessage;
}
