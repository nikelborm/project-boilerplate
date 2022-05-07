import { Repository } from 'typeorm';
import { EntityWithId } from '.';
import { differenceBetweenSetsInArray } from '..';

export async function getNotExistingEntityIds<T extends EntityWithId>(
  repo: Repository<T>,
  entitiesToCheck: EntityWithId[],
) {
  const entityIdsToCheck = entitiesToCheck.map(({ id }) => id);

  const entitiesFromDB = await repo
    .createQueryBuilder('entity')
    .select(['entity.id'])
    .whereInIds(entityIdsToCheck)
    .getMany();

  const entityIdsFromDB = entitiesFromDB.map(({ id }) => id);

  const notExistingEntityIds = differenceBetweenSetsInArray(
    new Set(entityIdsToCheck),
    new Set(entityIdsFromDB),
  );

  return {
    entityIdsToCheck,
    entityIdsFromDB,
    notExistingEntityIds,
  };
}
