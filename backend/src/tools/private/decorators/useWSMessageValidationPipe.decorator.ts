import {
  applyDecorators,
  UsePipes,
  ValidationPipeOptions,
} from '@nestjs/common';
import { WSMessageValidationPipe } from '../pipes';

export const UseWSMessageValidationPipe = (
  options?: ValidationPipeOptions,
): MethodDecorator =>
  applyDecorators(UsePipes(new WSMessageValidationPipe(options)));
