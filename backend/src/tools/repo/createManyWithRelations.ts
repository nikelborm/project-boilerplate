import { messages } from 'src/config';
import { Repository } from 'typeorm';
import { EntityWithId, NewEntity } from '.';
import { validateExistingId } from '..';

export function createManyWithRelations<T extends EntityWithId>(
  repo: Repository<T>,
  newEntities: NewEntity<T>[],
  entityName?: string,
  config?: { chunk?: number },
): Promise<T[]> {
  validateExistingId({
    entities: newEntities,
    shouldIdExist: false,
    errorText: messages.repo.common.cantCreateWithIds(newEntities, entityName),
  });
  // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
  return repo.save(newEntities, {
    chunk: config?.chunk,
  });
}
