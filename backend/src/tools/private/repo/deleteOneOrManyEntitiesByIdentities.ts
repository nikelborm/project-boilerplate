import type {
  EntityRepoMethodTypes,
  EntityRepoMethodTypesConfig,
} from 'src/types';
import type { Repository } from 'typeorm';

export const deleteEntityByIdentity =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <Types extends EntityRepoMethodTypes<Entity, Config>>(
    identity: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'],
  ): Promise<void> => {
    await repo.delete(identity);
  };

export const deleteManyEntitiesByIdentities =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <Types extends EntityRepoMethodTypes<Entity, Config>>(
    identities: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'][],
  ): Promise<void> => {
    await repo.delete(identities as any);
  };
