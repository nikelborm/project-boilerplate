import { Repository } from 'typeorm';
import { EntityWithId, SoftDeletingCriteria } from '.';

export async function softDeleteByCriteria<T extends EntityWithId>(
  repo: Repository<T>,
  criteria: SoftDeletingCriteria<T>,
  entityName?: string,
  config?: { disableExistingCheck?: boolean },
): Promise<void> {
  // TODO: Сделать проверку на то существует ли сущность с этим айди
  // TODO: Сделать возможность убрать проверку на существование сущностей
  await repo.softDelete(criteria);
}
