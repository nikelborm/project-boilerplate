import { InternalServerErrorException } from '@nestjs/common';
import { messages } from 'src/config';
import { Repository } from 'typeorm';
import { EntityWithId, PlainEntityWithoutId } from '.';
import { validateExistingId } from '..';

export async function createOnePlain<T extends EntityWithId>(
  repo: Repository<T>,
  newEntity: PlainEntityWithoutId<T>,
  entityName?: string,
) {
  validateExistingId({
    entity: newEntity,
    shouldIdExist: false,
    errorText: messages.repo.common.cantCreateWithId(newEntity, entityName),
  });
  // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
  const [entityWithOnlyId] = (await repo.insert(newEntity)).identifiers;

  if (!entityWithOnlyId?.id)
    throw new InternalServerErrorException(
      messages.repo.common.cantCreateOne(newEntity, entityName),
    );

  return { ...newEntity, ...entityWithOnlyId } as T;
}
