import type {
  EntityRepoMethodTypes,
  EntityRepoMethodTypesConfig,
  TypeormReturnTypeRequiredNullable,
} from 'src/types';

export abstract class IDefaultUniversalEntityRepo<
  Types extends EntityRepoMethodTypes<Entity, Config>,
  Entity extends Record<string, any> = Types['Entity'],
  Config extends EntityRepoMethodTypesConfig<Entity> = Types['Config'],
> {
  abstract getAll(): Promise<Types['Public']['SelectedOnePlainEntity'][]>;

  abstract createOnePlain<
    ProvidedPlainEntityToBeCreated extends Types['Public']['OnePlainEntityToBeCreated'],
  >(
    newEntity: ProvidedPlainEntityToBeCreated,
  ): Promise<
    TypeormReturnTypeRequiredNullable<
      ProvidedPlainEntityToBeCreated &
        Types['Parts']['GeneratedPartAfterEntityCreation']
    >
  >;

  abstract createManyPlain<
    ProvidedPlainEntityToBeCreated extends Types['Public']['OnePlainEntityToBeCreated'],
  >(
    newEntities: ProvidedPlainEntityToBeCreated[],
  ): Promise<
    TypeormReturnTypeRequiredNullable<
      ProvidedPlainEntityToBeCreated &
        Types['Parts']['GeneratedPartAfterEntityCreation']
    >[]
  >;

  abstract updateOnePlain<
    ProvidedUpdatedPart extends Types['Parts']['UpdatablePlainPart'],
  >(
    identity: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'],
    partToUpdate: ProvidedUpdatedPart,
  ): Promise<
    TypeormReturnTypeRequiredNullable<
      Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'] &
        ProvidedUpdatedPart
    >
  >;

  abstract updateManyPlain<
    ProvidedPlainEntityToBeUpdated extends Types['Public']['OnePlainEntityToBeUpdated'],
  >(
    entitiesToBeUpdated: ProvidedPlainEntityToBeUpdated[],
  ): Promise<
    TypeormReturnTypeRequiredNullable<ProvidedPlainEntityToBeUpdated>[]
  >;

  abstract updateOneWithRelations<
    ProvidedEntityWithRelationsToBeUpdated extends Types['Public']['OneEntityWithRelationsToBeUpdated'],
  >(
    entityToBeUpdated: ProvidedEntityWithRelationsToBeUpdated,
  ): Promise<
    TypeormReturnTypeRequiredNullable<ProvidedEntityWithRelationsToBeUpdated>
  >;

  abstract updateManyWithRelations<
    ProvidedEntityWithRelationsToBeUpdated extends Types['Public']['OneEntityWithRelationsToBeUpdated'],
  >(
    entitiesToBeUpdated: ProvidedEntityWithRelationsToBeUpdated[],
  ): Promise<
    TypeormReturnTypeRequiredNullable<ProvidedEntityWithRelationsToBeUpdated>[]
  >;
}

export abstract class IDefaultEntityWithIdRepo<
  Types extends EntityRepoMethodTypes<Entity, Config>,
  Entity extends { id: number } = Types['Entity'],
  Config extends EntityRepoMethodTypesConfig<Entity> = Types['Config'],
> extends IDefaultUniversalEntityRepo<Types> {
  abstract findOneById(
    id: number,
  ): Promise<Types['Public']['SelectedOnePlainEntity'] | null>;

  abstract findManyByIds(
    ids: number[],
  ): Promise<Types['Public']['SelectedOnePlainEntity'][]>;

  abstract deleteOneById(id: number): Promise<void>;
  abstract deleteManyByIds(ids: number[]): Promise<void>;
}

export abstract class IDefaultEntityWithIdentityRepo<
  Types extends EntityRepoMethodTypes<Entity, Config>,
  Entity extends Record<string, any> = Types['Entity'],
  Config extends EntityRepoMethodTypesConfig<Entity> = Types['Config'],
> extends IDefaultUniversalEntityRepo<Types> {
  abstract findOneByIdentity(
    identity: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'],
  ): Promise<Types['Public']['SelectedOnePlainEntity'] | null>;

  abstract findManyByIdentities(
    identities: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'][],
  ): Promise<Types['Public']['SelectedOnePlainEntity'][]>;

  abstract deleteOne(
    identity: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'],
  ): Promise<void>;

  abstract deleteMany(
    identities: Types['Parts']['IdentityPartRequiredForUpdateAndAlwaysSelected'][],
  ): Promise<void>;
}
