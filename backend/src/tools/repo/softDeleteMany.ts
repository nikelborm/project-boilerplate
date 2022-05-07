import { messages } from 'src/config';
import { Repository, DeepPartial } from 'typeorm';
import { EntityWithId } from '.';
import { validateExistingId } from '..';

export async function softDeleteMany<T extends EntityWithId>(
  repo: Repository<T>,
  entitiesToBeHidden: DeepPartial<T>[],
  entityName?: string,
  config?: { chunk?: number; disableExistingCheck?: boolean },
): Promise<void> {
  validateExistingId({
    entities: entitiesToBeHidden,
    shouldIdExist: true,
    errorText: messages.repo.common.cantDeleteWithoutIds(
      entitiesToBeHidden,
      entityName,
    ),
  });
  // TODO: Сделать проверку на то существует ли сущность с этим айди
  // TODO: Сделать возможность убрать проверку на существование сущностей
  await repo.softRemove(entitiesToBeHidden, {
    chunk: config?.chunk,
  });
}
