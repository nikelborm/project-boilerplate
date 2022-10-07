import { Body, ValidationPipe } from '@nestjs/common';

export const ValidatedBody: ParameterDecorator = (...args) => {
  return Body(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  )(...args);
};
