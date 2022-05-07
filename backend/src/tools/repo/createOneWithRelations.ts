import { messages } from 'src/config';
import { Repository } from 'typeorm';
import { EntityWithId, NewEntity } from '.';
import { validateExistingId } from '..';

export function createOneWithRelations<T extends EntityWithId>(
  repo: Repository<T>,
  newEntity: NewEntity<T>,
  entityName?: string,
): Promise<T> {
  validateExistingId({
    entity: newEntity,
    shouldIdExist: false,
    errorText: messages.repo.common.cantCreateWithId(newEntity, entityName),
  });
  // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
  return repo.save(newEntity);
}
