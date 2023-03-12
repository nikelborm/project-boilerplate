import type {
  EntityRepoMethodTypes,
  EntityRepoMethodTypesConfig,
} from 'src/types';
import type { Repository } from 'typeorm';

export const findOnePlainByIdentity =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <Types extends EntityRepoMethodTypes<Entity, Config>>(
    identity: Types['IdentityPartRequiredForUpdateAndAlwaysSelected'],
  ): Promise<Types['SelectedOnePlainEntity'] | null> => {
    return (await repo.findOne({
      where: identity,
    })) as Types['SelectedOnePlainEntity'] | null;
  };
