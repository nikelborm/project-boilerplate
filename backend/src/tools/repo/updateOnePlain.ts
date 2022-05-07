import { BadRequestException } from '@nestjs/common';
import { messages } from 'src/config';
import { Repository } from 'typeorm';
import { EntityWithId, PlainEntityWithoutId, doesEntityNotExist } from '.';
import { validateExistingId } from '..';

export async function updateOnePlain<T extends EntityWithId>(
  repo: Repository<T>,
  id: number,
  updated: PlainEntityWithoutId<T>,
  entityName?: string,
  config?: { disableExistingCheck?: boolean },
): Promise<void> {
  validateExistingId({
    entity: { id },
    shouldIdExist: true,
    errorText: messages.repo.common.cantUpdateWithoutId(
      {
        id,
        updated,
      },
      entityName,
    ),
  });
  // TODO: Сделать возможность убрать проверку на существование сущностей
  if (await doesEntityNotExist(repo, { id }))
    throw new BadRequestException(
      messages.repo.common.cantUpdateOneNotFound(id, entityName),
    );

  // @ts-expect-error мы выпилили айди, ибо обновлять айди нет смысла, вот он и ругается
  await repo.update(id, updated);
}
