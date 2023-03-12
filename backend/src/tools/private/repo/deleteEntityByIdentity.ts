import type {
  EntityRepoMethodTypes,
  EntityRepoMethodTypesConfig,
} from 'src/types';
import type { Repository } from 'typeorm';

export const deleteEntityByIdentity =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <Types extends EntityRepoMethodTypes<Entity, Config>>(
    identity: Types['IdentityPartRequiredForUpdateAndAlwaysSelected'],
  ): Promise<void> => {
    await repo.delete(identity);
  };
