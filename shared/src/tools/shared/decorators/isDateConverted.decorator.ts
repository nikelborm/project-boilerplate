import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';
import { combineDecorators } from '../combineDecorators';

export function IsDateConverted(): PropertyDecorator {
  return combineDecorators(
    Type(() => Date),
    IsDate(),
  );
}
