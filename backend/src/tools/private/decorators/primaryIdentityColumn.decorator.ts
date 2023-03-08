import { applyDecorators } from '@nestjs/common';
import { Column, ColumnOptions } from 'typeorm';

export function PrimaryIdentityColumn(
  columnName: string,
  options?: ColumnOptions,
): PropertyDecorator {
  return applyDecorators(
    Column({
      name: columnName,
      type: 'int',
      primary: true,
      generated: 'identity',
      generatedIdentity: 'ALWAYS',
      nullable: false,
      ...options,
    }),
  );
}
