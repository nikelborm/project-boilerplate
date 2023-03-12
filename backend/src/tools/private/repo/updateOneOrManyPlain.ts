import type {
  EntityRepoMethodTypesConfig,
  EntityRepoMethodTypes,
} from 'src/types';
import type { Repository } from 'typeorm';

export const updateManyPlain =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <
    Types extends EntityRepoMethodTypes<Entity, Config>,
    ProvidedPlainEntityToBeUpdated extends Types['OnePlainEntityToBeUpdated'],
    ReturnType extends Required<ProvidedPlainEntityToBeUpdated>,
  >(
    entitiesToBeUpdated: ProvidedPlainEntityToBeUpdated[],
  ): Promise<ReturnType[]> => {
    const updatedEntities = await repo.save(entitiesToBeUpdated as any);
    return updatedEntities as unknown as ReturnType[];
  };

export const updateOnePlain =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <
    Types extends EntityRepoMethodTypes<Entity, Config>,
    ProvidedUpdatedPart extends Types['UpdatablePlainPart'],
    ReturnType extends Required<
      Types['IdentityPartRequiredForUpdateAndAlwaysSelected'] &
        ProvidedUpdatedPart
    >,
  >(
    identity: Types['IdentityPartRequiredForUpdateAndAlwaysSelected'],
    partToUpdate: ProvidedUpdatedPart,
  ): Promise<ReturnType> => {
    await repo.update(identity, partToUpdate as any);
    return { ...identity, ...partToUpdate } as unknown as ReturnType;
  };
