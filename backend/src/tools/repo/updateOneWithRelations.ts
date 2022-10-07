import { ObjectLiteral, Repository } from 'typeorm';
import { UpdateEntity } from './types';

export async function updateOneWithRelations<
  BaseEntity extends ObjectLiteral,
  PrimaryKeys extends string = 'id',
>(
  repo: Repository<BaseEntity>,
  UpdateEntity: UpdateEntity<BaseEntity, PrimaryKeys>,
): Promise<BaseEntity> {
  console.log(
    'updateOneWithRelations before repo.save UpdateEntity:',
    UpdateEntity,
  );
  // @ts-expect-error asd
  const shit = await repo.save(UpdateEntity);
  console.log('updateOneWithRelations repo.save shit:', shit);
  console.log(
    'updateOneWithRelations after repo.save UpdateEntity:',
    UpdateEntity,
  );
  // @ts-expect-error asd
  return shit;
}
