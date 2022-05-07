import { BadRequestException } from '@nestjs/common';
import { messages } from 'src/config';
import { Repository } from 'typeorm';
import { EntityWithId, UpdatedEntity, doesEntityNotExist } from '.';
import { validateExistingId } from '..';

export async function updateOneWithRelations<T extends EntityWithId>(
  repo: Repository<T>,
  updatedEntity: UpdatedEntity<T>,
  entityName?: string,
  config?: { disableExistingCheck?: boolean },
): Promise<T> {
  validateExistingId({
    entity: updatedEntity,
    shouldIdExist: true,
    errorText: messages.repo.common.cantUpdateWithoutId(
      updatedEntity,
      entityName,
    ),
  });
  if (
    !config?.disableExistingCheck &&
    (await doesEntityNotExist(repo, updatedEntity))
  )
    throw new BadRequestException(
      messages.repo.common.cantUpdateOneNotFound(updatedEntity.id, entityName),
    );

  //@ts-expect-error asdd
  return repo.save(updatedEntity);
}
