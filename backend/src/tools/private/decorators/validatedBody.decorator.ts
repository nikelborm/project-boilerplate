import { Body, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { validationPipeConfig } from 'src/config';

export const ValidatedBody: (
  options?: ValidationPipeOptions,
) => ParameterDecorator = (options) =>
  Body(new ValidationPipe({ ...validationPipeConfig, ...options }));
