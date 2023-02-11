import { ObjectLiteral, Repository } from 'typeorm';
import { CreatedPlainEntity, NewPlainEntity } from './types';

export async function createOnePlain<
  BaseEntity extends ObjectLiteral,
  KeysGeneratedByDB extends string = 'id',
>(
  repo: Repository<BaseEntity>,
  { ...newEntity }: NewPlainEntity<BaseEntity, KeysGeneratedByDB>,
): Promise<CreatedPlainEntity<BaseEntity, KeysGeneratedByDB>> {
  // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
  const { generatedMaps, identifiers, raw } = await repo.insert(newEntity);
  console.log('createOnePlain repo.insert result: ', {
    generatedMaps,
    identifiers,
    raw,
  });

  // @ts-expect-error TODO
  return { ...newEntity, ...generatedMaps, ...identifiers };
}
