import type {
  EntityRepoMethodTypes,
  EntityRepoMethodTypesConfig,
} from 'src/types';
import type { Repository } from 'typeorm';

export const findOnePlainByIdentity =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <Types extends EntityRepoMethodTypes<Entity, Config>>(
    identity: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'],
  ): Promise<Types['Public']['SelectedOnePlainEntity'] | null> => {
    return (await repo.findOne({
      where: identity,
    })) as Types['Public']['SelectedOnePlainEntity'] | null;
  };

export const findManyPlainByIdentities =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <Types extends EntityRepoMethodTypes<Entity, Config>>(
    identities: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'][],
  ): Promise<Types['Public']['SelectedOnePlainEntity'][]> => {
    return (await repo.find({
      where: identities,
    })) as Types['Public']['SelectedOnePlainEntity'][];
  };
