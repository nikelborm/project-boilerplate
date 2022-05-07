import { BadRequestException } from '@nestjs/common';
import { messages } from 'src/config';
import { Repository } from 'typeorm';
import { EntityWithId, PlainEntityWithoutId } from '.';
import { validateExistingId } from '..';

export async function createManyPlain<T extends EntityWithId>(
  repo: Repository<T>,
  newEntities: PlainEntityWithoutId<T>[],
  entityName?: string,
) {
  validateExistingId({
    entities: newEntities,
    shouldIdExist: false,
    errorText: messages.repo.common.cantCreateWithIds(newEntities, entityName),
  });
  // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
  const entitiesWithOnlyIds = (await repo.insert(newEntities)).identifiers;

  if (entitiesWithOnlyIds.length !== newEntities.length)
    throw new BadRequestException(
      messages.repo.common.cantCreateMany(newEntities, entityName),
    );

  return newEntities.map((newEntity, index) => ({
    ...newEntity,
    ...entitiesWithOnlyIds[index],
  })) as T[];
}
