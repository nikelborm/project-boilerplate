import { Repository } from 'typeorm';
import { EntityAfterUpdate, UpdateEntity } from './types';

export async function updateManyWithRelations<
  BaseEntity,
  PrimaryKeys extends string = 'id',
>(
  repo: Repository<BaseEntity>,
  updatedEntities: UpdateEntity<BaseEntity, PrimaryKeys>[],
  entityName?: string,
  config?: { chunk?: number; disableExistingCheck?: boolean },
): Promise<EntityAfterUpdate<BaseEntity, PrimaryKeys>[]> {
  console.log(
    'updateManyWithRelations updatedEntities before insert',
    updatedEntities,
  );
  //@ts-expect-error asd
  const shit = await repo.save(updatedEntities, {
    chunk: config?.chunk,
  });
  console.log('updateManyWithRelations repo.save shit: ', shit);
  console.log(
    'updateManyWithRelations updatedEntities after insert',
    updatedEntities,
  );
  // @ts-expect-error asd
  return shit;
}
