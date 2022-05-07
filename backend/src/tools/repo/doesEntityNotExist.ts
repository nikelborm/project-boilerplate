import { Repository } from 'typeorm';
import { EntityWithId } from '.';

export async function doesEntityNotExist<T extends EntityWithId>(
  repo: Repository<T>,
  entityToCheck: EntityWithId,
) {
  const entityFromDB = await repo
    .createQueryBuilder('entity')
    .select(['entity.id'])
    .where('entity.id = :entityToCheckId', {
      entityToCheckId: entityToCheck.id,
    })
    .limit(1)
    .getOne();
  return !entityFromDB;
}
