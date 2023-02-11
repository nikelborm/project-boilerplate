import { ObjectLiteral, Repository } from 'typeorm';
import { UpdatePlainEntity } from './types';

export async function updateOnePlain<
  BaseEntity extends ObjectLiteral,
  PrimaryKeys extends string = 'id',
>(
  repo: Repository<BaseEntity>,
  UpdateEntity: UpdatePlainEntity<BaseEntity, PrimaryKeys>,
): Promise<void> {
  console.log('updateOnePlain before repo.update UpdateEntity: ', UpdateEntity);
  // @ts-expect-error при создании мы не можем указать айди, поэтому мы его выпилили
  const shit = await repo.update(id, updated);
  console.log('updateOnePlain repo.update shit: ', shit);
  console.log('updateOnePlain after repo.update UpdateEntity: ', UpdateEntity);
}
