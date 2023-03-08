import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { combineDecorators } from '../combineDecorators';

export function NestedArrayDTO<T>(
  DTOClassConstructor: () => {
    new (): T;
  },
): PropertyDecorator {
  return combineDecorators(
    IsDefined(),
    IsArray(),
    ValidateNested({ each: true }),
    Type(DTOClassConstructor),
  );
}
