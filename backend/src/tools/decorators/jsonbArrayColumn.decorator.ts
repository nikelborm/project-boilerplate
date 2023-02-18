import { applyDecorators } from '@nestjs/common';
import { Column } from 'typeorm';

export function JsonbArrayColumn(
  columnName: string,
  disableSelect = false,
): PropertyDecorator {
  return applyDecorators(
    Column({
      name: columnName,
      select: !disableSelect,
      type: 'jsonb',
      array: false,
      default: () => "'[]'",
      nullable: false,
    }),
  );
}
