import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function ApiController(name: string): ClassDecorator {
  return applyDecorators(ApiTags(name), Controller(name));
}
