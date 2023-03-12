import type {
  EntityRepoMethodTypes,
  EntityRepoMethodTypesConfig,
} from 'src/types';
import type { Repository } from 'typeorm';

export const getAllEntities =
  <Entity extends Record<string, any>>(repo: Repository<Entity>) =>
  <Config extends EntityRepoMethodTypesConfig<Entity>>() =>
  async <Types extends EntityRepoMethodTypes<Entity, Config>>(): Promise<
    Types['SelectedOnePlainEntity'][]
  > => {
    return (await repo.find()) as Types['SelectedOnePlainEntity'][];
  };
