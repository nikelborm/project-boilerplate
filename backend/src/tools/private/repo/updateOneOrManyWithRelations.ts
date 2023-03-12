import type {
  EntityRepoMethodTypesConfig,
  EntityRepoMethodTypes,
} from 'src/types';
import type { Repository } from 'typeorm';

export const updateManyWithRelations =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <
    Types extends EntityRepoMethodTypes<Entity, Config>,
    ProvidedEntityWithRelationsToBeUpdated extends Types['OneEntityWithRelationsToBeUpdated'],
    ReturnType extends Required<ProvidedEntityWithRelationsToBeUpdated>,
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
    ProvidedEntityWithRelationsToBeUpdated extends Types['OneEntityWithRelationsToBeUpdated'],
    ReturnType extends Required<ProvidedEntityWithRelationsToBeUpdated>,
  >(
    entityToBeUpdated: ProvidedEntityWithRelationsToBeUpdated,
  ): Promise<ReturnType> => {
    const updatedEntity = await repo.save(entityToBeUpdated as any);
    return updatedEntity as unknown as ReturnType;
  };
