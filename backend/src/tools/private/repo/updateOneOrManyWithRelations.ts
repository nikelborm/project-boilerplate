import type {
  EntityRepoMethodTypesConfig,
  EntityRepoMethodTypes,
  TypeormReturnTypeRequiredNullable,
} from 'src/types';
import type { Repository } from 'typeorm';

export const updateManyWithRelations =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <
    Types extends EntityRepoMethodTypes<Entity, Config>,
    ProvidedEntityWithRelationsToBeUpdated extends Types['Public']['OneEntityWithRelationsToBeUpdated'],
    ReturnType extends TypeormReturnTypeRequiredNullable<ProvidedEntityWithRelationsToBeUpdated>,
  >(
    entitiesToBeUpdated: ProvidedEntityWithRelationsToBeUpdated[],
  ): Promise<ReturnType[]> => {
    const updatedEntities = await repo.save(entitiesToBeUpdated as any);
    return updatedEntities as unknown as ReturnType[];
  };

export const updateOneWithRelations =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <
    Types extends EntityRepoMethodTypes<Entity, Config>,
    ProvidedEntityWithRelationsToBeUpdated extends Types['Public']['OneEntityWithRelationsToBeUpdated'],
    ReturnType extends TypeormReturnTypeRequiredNullable<ProvidedEntityWithRelationsToBeUpdated>,
  >(
    entityToBeUpdated: ProvidedEntityWithRelationsToBeUpdated,
  ): Promise<ReturnType> => {
    const updatedEntity = await repo.save(entityToBeUpdated as any);
    return updatedEntity as unknown as ReturnType;
  };

export type asd3<
  Entity extends Record<string, any>,
  Config extends EntityRepoMethodTypesConfig<Entity>,
  Types extends EntityRepoMethodTypes<Entity, Config>,
  ProvidedEntityWithRelationsToBeUpdated extends Types['Public']['OneEntityWithRelationsToBeUpdated'],
  ReturnType extends TypeormReturnTypeRequiredNullable<ProvidedEntityWithRelationsToBeUpdated>,
> = (
  repo: Repository<Entity>,
) => () => (
  entitiesToBeUpdated: ProvidedEntityWithRelationsToBeUpdated[],
) => Promise<ReturnType[]>;
