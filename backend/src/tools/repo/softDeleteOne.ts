import { messages } from 'src/config';
import { Repository, DeepPartial } from 'typeorm';
import { EntityWithId } from '.';
import { validateExistingId } from '..';

export async function softDeleteOne<T extends EntityWithId>(
  repo: Repository<T>,
  entityToBeHidden: DeepPartial<T>,
  entityName?: string,
  config?: { disableExistingCheck?: boolean },
): Promise<void> {
  validateExistingId({
    entity: entityToBeHidden,
    shouldIdExist: true,
    errorText: messages.repo.common.cantDeleteWithoutId(
      entityToBeHidden,
      entityName,
    ),
  });
  // TODO: Сделать проверку на то существует ли сущность с этим айди
  // TODO: Сделать возможность убрать проверку на существование сущностей
  await repo.softRemove(entityToBeHidden);
}
