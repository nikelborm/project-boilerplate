import { Repository } from 'typeorm';
import { NewEntity, CreatedEntity } from '.';

export async function createOneWithRelations<
  BaseEntity,
  KeysGeneratedByDB extends string = 'id',
>(
  repo: Repository<BaseEntity>,
  // это необходимо чтобы тайпорм не вписывала добавленные айдишники в исходные newEntities
  { ...newEntity }: NewEntity<BaseEntity, KeysGeneratedByDB>,
): Promise<CreatedEntity<BaseEntity, KeysGeneratedByDB>> {
  // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
  const insertedEntityWithGeneratedPart = await repo.save(newEntity);
  // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
  return insertedEntityWithGeneratedPart;
}
