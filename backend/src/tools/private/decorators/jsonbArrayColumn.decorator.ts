import { applyDecorators } from '@nestjs/common';
import type { ColumnOptions } from 'typeorm';
import { Column } from 'typeorm';

export function JsonbArrayColumn(
  columnName: string,
  options?: ColumnOptions,
): PropertyDecorator {
  return applyDecorators(
    Column({
      name: columnName,
      type: 'jsonb',
      array: false,
      default: () => "'[]'", // do not add ::jsonb, because it will mess in your migrations
      nullable: false,
      ...options,
    }),
  );
}
