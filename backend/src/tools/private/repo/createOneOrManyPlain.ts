import type {
  EntityRepoMethodTypes,
  EntityRepoMethodTypesConfig,
  TypeormReturnTypeRequiredNullable,
} from 'src/types';
import type { Repository } from 'typeorm';

export const createManyPlain =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <
    Types extends EntityRepoMethodTypes<Entity, Config>,
    ProvidedPlainEntityToBeCreated extends Types['Public']['OnePlainEntityToBeCreated'],
    ReturnType extends TypeormReturnTypeRequiredNullable<
      ProvidedPlainEntityToBeCreated &
        Types['Parts']['GeneratedPartAfterEntityCreation']
    >,
  >(
    newEntities: ProvidedPlainEntityToBeCreated[],
  ): Promise<ReturnType[]> => {
    const { generatedMaps } = await repo.insert(
      newEntities as unknown as Entity[],
    );
    if (newEntities.length !== generatedMaps.length)
      throw new Error(
        'insertManyPlain newEntities.length !== generatedMaps.length',
      );
    return newEntities.map((entity, index) => ({
      ...entity,
      // eslint-disable-next-line security/detect-object-injection
      ...generatedMaps[index],
    })) as ReturnType[];
  };

export const createOnePlain =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <
    Types extends EntityRepoMethodTypes<Entity, Config>,
    const ProvidedPlainEntityToBeCreated extends Types['Public']['OnePlainEntityToBeCreated'],
    ReturnType extends TypeormReturnTypeRequiredNullable<
      ProvidedPlainEntityToBeCreated &
        Types['Parts']['GeneratedPartAfterEntityCreation']
    >,
  >(
    newEntity: ProvidedPlainEntityToBeCreated,
  ): Promise<ReturnType> => {
    const [returnedEntity] = await createManyPlain(repo)<Config>()([newEntity]);
    return returnedEntity as ReturnType;
  };
