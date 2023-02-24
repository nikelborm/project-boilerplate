import {
  applyDecorators,
  Body,
  UsePipes,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { validationPipeConfig } from 'src/config';
import { WSMessageValidationPipe } from '../pipes';

export const ValidatedBody: (
  options?: ValidationPipeOptions,
) => ParameterDecorator = (options) =>
  Body(new ValidationPipe({ ...validationPipeConfig, ...options }));

export const UseWSMessageValidationPipe = (
  options?: ValidationPipeOptions,
): MethodDecorator =>
  applyDecorators(UsePipes(new WSMessageValidationPipe(options)));
