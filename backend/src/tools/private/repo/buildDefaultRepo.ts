import {
  EntityRepoMethodTypes,
  EntityRepoMethodTypesConfig,
  IDefaultUniversalRepo,
  IDefaultEntityWithIdRepo,
  IDefaultEntityRepo,
  TypeormReturnTypeRequiredNullable,
} from 'src/types';
import { Repository } from 'typeorm';
import {
  createManyPlain,
  createOnePlain,
  deleteEntityByIdentity,
  deleteManyEntitiesByIdentities,
  findOnePlainByIdentity,
  findManyPlainByIdentities,
  getAllEntities,
  updateManyPlain,
  updateManyWithRelations,
  updateOnePlain,
  updateOneWithRelations,
} from '.';

export class DefaultUniversalRepoImplementation<
  Types extends EntityRepoMethodTypes<Entity, Config>,
  Entity extends Record<string, any> = Types['Entity'],
  Config extends EntityRepoMethodTypesConfig<Entity> = Types['Config'],
> implements IDefaultUniversalRepo<Types>
{
  constructor(protected readonly repo: Repository<Entity>) {}

  async getAll(): Promise<Types['Public']['SelectedOnePlainEntity'][]> {
    return await getAllEntities(this.repo)<Config>()();
  }

  async createOnePlain<
    ProvidedPlainEntityToBeCreated extends Types['Public']['OnePlainEntityToBeCreated'],
  >(
    newEntity: ProvidedPlainEntityToBeCreated,
  ): Promise<
    TypeormReturnTypeRequiredNullable<
      ProvidedPlainEntityToBeCreated &
        Types['Parts']['GeneratedPartAfterEntityCreation']
    >
  > {
    //@ts-expect-error too hard to explain this shit, but it is ok to have error here
    return await createOnePlain(this.repo)<Config>()(newEntity);
  }

  async createManyPlain<
    ProvidedPlainEntityToBeCreated extends Types['Public']['OnePlainEntityToBeCreated'],
  >(
    newEntities: ProvidedPlainEntityToBeCreated[],
  ): Promise<
    TypeormReturnTypeRequiredNullable<
      ProvidedPlainEntityToBeCreated &
        Types['Parts']['GeneratedPartAfterEntityCreation']
    >[]
  > {
    //@ts-expect-error too hard to explain this shit, but it is ok to have error here
    return await createManyPlain(this.repo)<Config>()(newEntities);
  }

  async updateOnePlain<
    ProvidedUpdatedPart extends Types['Parts']['UpdatablePlainPart'],
  >(
    identity: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'],
    partToUpdate: ProvidedUpdatedPart,
  ): Promise<
    TypeormReturnTypeRequiredNullable<
      Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'] &
        ProvidedUpdatedPart
    >
  > {
    return await updateOnePlain(this.repo)<Config>()(identity, partToUpdate);
  }

  async updateManyPlain<
    ProvidedPlainEntityToBeUpdated extends Types['Public']['OnePlainEntityToBeUpdated'],
  >(
    entitiesToBeUpdated: ProvidedPlainEntityToBeUpdated[],
  ): Promise<
    TypeormReturnTypeRequiredNullable<ProvidedPlainEntityToBeUpdated>[]
  > {
    return await updateManyPlain(this.repo)<Config>()(entitiesToBeUpdated);
  }

  async updateOneWithRelations<
    ProvidedEntityWithRelationsToBeUpdated extends Types['Public']['OneEntityWithRelationsToBeUpdated'],
  >(
    entityToBeUpdated: ProvidedEntityWithRelationsToBeUpdated,
  ): Promise<
    TypeormReturnTypeRequiredNullable<ProvidedEntityWithRelationsToBeUpdated>
  > {
    return await updateOneWithRelations(this.repo)<Config>()(entityToBeUpdated);
  }

  async updateManyWithRelations<
    ProvidedEntityWithRelationsToBeUpdated extends Types['Public']['OneEntityWithRelationsToBeUpdated'],
  >(
    entitiesToBeUpdated: ProvidedEntityWithRelationsToBeUpdated[],
  ): Promise<
    TypeormReturnTypeRequiredNullable<ProvidedEntityWithRelationsToBeUpdated>[]
  > {
    return await updateManyWithRelations(this.repo)<Config>()(
      entitiesToBeUpdated,
    );
  }
}

export class DefaultEntityWithIdRepoImplementation<
    Types extends EntityRepoMethodTypes<Entity, Config>,
    Entity extends { id: number } = Types['Entity'],
    Config extends EntityRepoMethodTypesConfig<Entity> = Types['Config'],
  >
  extends DefaultUniversalRepoImplementation<Types>
  implements IDefaultEntityWithIdRepo<Types>
{
  async findOneById(
    id: number,
  ): Promise<Types['Public']['SelectedOnePlainEntity'] | null> {
    //@ts-expect-error too hard to explain this shit, but it is ok to have error here
    return await findOnePlainByIdentity(this.repo)<Config>()({ id });
  }

  async findManyByIds(
    ids: number[],
  ): Promise<Types['Public']['SelectedOnePlainEntity'][]> {
    //@ts-expect-error too hard to explain this shit, but it is ok to have error here
    return await findManyPlainByIdentities(this.repo)<Config>()(ids);
  }

  async deleteOneById(id: number): Promise<void> {
    //@ts-expect-error too hard to explain this shit, but it is ok to have error here
    await deleteEntityByIdentity(this.repo)<Config>()({ id });
  }

  async deleteManyByIds(ids: number[]): Promise<void> {
    await deleteManyEntitiesByIdentities(this.repo)<Config>()(
      //@ts-expect-error too hard to explain this shit, but it is ok to have error here
      ids.map((id) => ({ id })),
    );
  }
}

export class DefaultEntityRepoImplementation<
    Types extends EntityRepoMethodTypes<Entity, Config>,
    Entity extends Record<string, any> = Types['Entity'],
    Config extends EntityRepoMethodTypesConfig<Entity> = Types['Config'],
  >
  extends DefaultUniversalRepoImplementation<Types>
  implements IDefaultEntityRepo<Types>
{
  async findOneByIdentity(
    identity: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'],
  ): Promise<Types['Public']['SelectedOnePlainEntity'] | null> {
    return await findOnePlainByIdentity(this.repo)<Config>()(identity);
  }

  async findManyByIdentities(
    identities: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'][],
  ): Promise<Types['Public']['SelectedOnePlainEntity'][]> {
    return await findManyPlainByIdentities(this.repo)<Config>()(identities);
  }

  async deleteOne(
    identity: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'],
  ): Promise<void> {
    await deleteEntityByIdentity(this.repo)<Config>()(identity);
  }

  async deleteMany(
    identities: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'][],
  ): Promise<void> {
    await deleteManyEntitiesByIdentities(this.repo)<Config>()(identities);
  }
}
