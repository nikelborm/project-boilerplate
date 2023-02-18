import { applyDecorators } from '@nestjs/common';
import { Column } from 'typeorm';

export function PrimaryIdentityColumn(columnName: string): PropertyDecorator {
  return applyDecorators(
    Column({
      name: columnName,
      primary: true,
      generated: 'identity',
      generatedIdentity: 'ALWAYS',
      nullable: false,
    }),
  );
}
