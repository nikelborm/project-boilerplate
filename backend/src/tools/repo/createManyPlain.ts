import { BadRequestException } from '@nestjs/common';
import { messages } from 'src/config';
import { Repository } from 'typeorm';
import { CreatedPlainEntity, NewPlainEntity } from '.';

export async function createManyPlain<
  BaseEntity,
  KeysGeneratedByDB extends string = 'id',
>(
  repo: Repository<BaseEntity>,
  newEntities: NewPlainEntity<BaseEntity, KeysGeneratedByDB>[],
  entityName?: string,
): Promise<CreatedPlainEntity<BaseEntity, KeysGeneratedByDB>[]> {
  console.log('createManyPlain newEntities before repo.insert: ', newEntities);
  // @ts-expect-error при создании мы не можем указать автогенерируемые значения, поэтому мы их выпилили
  const shit = await repo.insert(newEntities);
  console.log('createManyPlain repo.insert shit: ', shit);
  console.log('createManyPlain newEntities after repo.insert: ', newEntities);
  const entitiesWithOnlyIds = shit.identifiers;

  // todo: check if inserted entities looks normal
  if (entitiesWithOnlyIds.length !== newEntities.length)
    throw new BadRequestException(
      messages.repo.common.cantCreateMany(newEntities, entityName),
    );

  //@ts-expect-error TODO
  return newEntities.map((newEntity, index) => ({
    ...newEntity,
    ...entitiesWithOnlyIds[index],
  })) as BaseEntity[];
}
