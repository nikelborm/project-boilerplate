import { ObjectLiteral, Repository } from 'typeorm';
import { CreatedEntity, NewEntity } from '.';

export async function createManyWithRelations<
  BaseEntity extends ObjectLiteral,
  KeysGeneratedByDB extends string = 'id',
>(
  repo: Repository<BaseEntity>,
  newEntities: NewEntity<BaseEntity, KeysGeneratedByDB>[],
  config?: { chunk?: number },
): Promise<CreatedEntity<BaseEntity, KeysGeneratedByDB>[]> {
  const insertedEntitiesWithGeneratedParts = await repo.save(
    // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
    newEntities.map(({ ...rest }) => rest), // это необходимо чтобы тайпорм не вписывала добавленные айдишники в исходные newEntities
    { chunk: config?.chunk },
  );
  // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
  return insertedEntitiesWithGeneratedParts;
}
