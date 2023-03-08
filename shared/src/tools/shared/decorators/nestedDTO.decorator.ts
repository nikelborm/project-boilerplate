import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { combineDecorators } from '../combineDecorators';

export function NestedDTO<T>(
  DTOClassConstructor: () => {
    new (): T;
  },
): PropertyDecorator {
  return combineDecorators(
    IsDefined(),
    ValidateNested(),
    Type(DTOClassConstructor),
  );
}
