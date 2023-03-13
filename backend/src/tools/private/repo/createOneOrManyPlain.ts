import type {
  EntityRepoMethodTypes,
  EntityRepoMethodTypesConfig,
} from 'src/types';
import type { Repository } from 'typeorm';

export const createManyPlain =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <
    Types extends EntityRepoMethodTypes<Entity, Config>,
    ProvidedPlainEntityToBeCreated extends Types['OnePlainEntityToBeCreated'],
    ReturnType extends Required<
      ProvidedPlainEntityToBeCreated & Types['GeneratedPartAfterEntityCreation']
    >,
  >(
    newEntities: ProvidedPlainEntityToBeCreated[],
  ): Promise<ReturnType[]> => {
    const { generatedMaps } = await repo.insert(newEntities as any);
    if (newEntities.length !== generatedMaps.length)
      throw new Error(
        'insertManyPlain newEntities.length !== generatedMaps.length',
      );
    return newEntities.map((entity, index) => ({
      ...entity,
      ...generatedMaps[index],
    })) as ReturnType[];
  };

export const createOnePlain =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <
    Types extends EntityRepoMethodTypes<Entity, Config>,
    ProvidedPlainEntityToBeCreated extends Types['OnePlainEntityToBeCreated'],
    ReturnType extends Required<
      ProvidedPlainEntityToBeCreated & Types['GeneratedPartAfterEntityCreation']
    >,
  >(
    newEntity: ProvidedPlainEntityToBeCreated,
  ): Promise<ReturnType> => {
    const [returnedEntity] = await createManyPlain(repo)<Config>()([newEntity]);
    return returnedEntity as ReturnType;
  };
