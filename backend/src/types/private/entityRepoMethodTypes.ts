import type { RelationMap } from '../../types/private';
import type { DeArrayOrFail } from '../shared';
import type { DBModelNames } from './modelNames';
import type * as model from '../shared/model';

export type EntityRepoMethodTypes<
  Entity extends Record<string, any>,
  Config extends EntityRepoMethodTypesConfig<Entity>,
> = {
  Config: Config;

  Entity: Entity;

  Parts: EntityRepoTypeParts<Entity, Config>;

  Public: PublicMethodTypesOfRepo<Entity, Config>;
};

export type EntityRepoTypeParts<
  Entity extends Record<string, any>,
  Config extends EntityRepoMethodTypesConfig<Entity>,
> = {
  // ---------------------- Import left keys that came not from config but from RelationMap

  RelationKeys: keyof RelationMap[Config['EntityName']]['relationToEntityNameMap'];

  IdentityPlainKeys: DeArrayOrFail<
    RelationMap[Config['EntityName']]['identityKeys']
  >;

  // ------------------------- Little pieces which are part of final formatted object types

  GeneratedPartAfterEntityCreation: Config['ForbiddenToCreateGeneratedPlainKeys'] extends keyof Entity
    ? Pick<Entity, Config['ForbiddenToCreateGeneratedPlainKeys']>
    : Record<never, never>;

  IdentityPartRequiredForUpdateAndAlwaysSelected: EntityRepoTypeParts<
    Entity,
    Config
  >['IdentityPlainKeys'] extends keyof Entity
    ? Pick<Entity, EntityRepoTypeParts<Entity, Config>['IdentityPlainKeys']>
    : never;

  RequiredToCreateAndSelectPlainPart: Config['RequiredToCreateAndSelectRegularPlainKeys'] extends keyof Entity
    ? Pick<Entity, Config['RequiredToCreateAndSelectRegularPlainKeys']>
    : Record<never, never>;

  OptionalToCreatePlainPart: Config['OptionalToCreateAndSelectRegularPlainKeys'] extends keyof Entity
    ? Partial<Pick<Entity, Config['OptionalToCreateAndSelectRegularPlainKeys']>>
    : Record<never, never>;

  UpdatablePlainPart: TypeormInputTypeNotRequiredNullable<
    Partial<
      OmitIfProvidedKeysAreNotNull<
        EntityRepoTypeParts<
          Entity,
          Config
        >['RequiredToCreateAndSelectPlainPart'] &
          EntityRepoTypeParts<Entity, Config>['OptionalToCreatePlainPart'],
        Config['ForbiddenToUpdatePlainKeys'],
        Entity
      >
    >
  >;

  OriginalPartWithRelations: EntityRepoTypeParts<
    Entity,
    Config
  >['RelationKeys'] extends keyof Entity
    ? Pick<Entity, EntityRepoTypeParts<Entity, Config>['RelationKeys']>
    : Record<never, never>;

  PartWithRelationsOptimizedForUpdates: EntityRepoTypeParts<
    Entity,
    Config
  >['RelationKeys'] extends keyof Entity
    ? {
        [RelationalKey in EntityRepoTypeParts<
          Entity,
          Config
        >['RelationKeys']]?: RelationalKey extends keyof RelationMap[Config['EntityName']]['relationToEntityNameMap']
          ? RelationMap[Config['EntityName']]['relationToEntityNameMap'][RelationalKey] extends infer RelatedEntityNameWrapped
            ? RelatedEntityNameWrapped extends readonly [
                infer RelatedEntityName,
              ]
              ? GetRelationPartBy<RelatedEntityName>[]
              : RelatedEntityNameWrapped extends infer RelatedEntityName
              ? GetRelationPartBy<RelatedEntityName>
              : Record<never, never>
            : Record<never, never>
          : Record<never, never>;
      }
    : Record<never, never>;

  UpdatableRelationalPart: Partial<
    OmitIfProvidedKeysAreNotNull<
      EntityRepoTypeParts<
        Entity,
        Config
      >['PartWithRelationsOptimizedForUpdates'],
      Config['ForbiddenToUpdateRelationKeys'],
      Entity
    >
  >;

  PossiblyCanBeSelectedPlainPart: EntityRepoTypeParts<
    Entity,
    Config
  >['IdentityPartRequiredForUpdateAndAlwaysSelected'] &
    EntityRepoTypeParts<Entity, Config>['RequiredToCreateAndSelectPlainPart'] &
    EntityRepoTypeParts<Entity, Config>['OptionalToCreatePlainPart'];
};

export type PublicMethodTypesOfRepo<
  Entity extends Record<string, any>,
  Config extends EntityRepoMethodTypesConfig<Entity>,
> = {
  Parts: EntityRepoTypeParts<Entity, Config>;

  OnePlainEntityToBeCreated: OmitIfProvidedKeysAreNotNull<
    EntityRepoTypeParts<Entity, Config>['RequiredToCreateAndSelectPlainPart'] &
      TypeormInputTypeNotRequiredNullable<
        EntityRepoTypeParts<Entity, Config>['OptionalToCreatePlainPart']
      >,
    Config['ForbiddenToCreateGeneratedPlainKeys'],
    Entity
  >;

  // OneEntityWithRelationsToBeCreated should be disallowed

  OnePlainEntityToBeUpdated: EntityRepoTypeParts<
    Entity,
    Config
  >['IdentityPartRequiredForUpdateAndAlwaysSelected'] &
    EntityRepoTypeParts<Entity, Config>['UpdatablePlainPart'];

  OneEntityWithRelationsToBeUpdated: PublicMethodTypesOfRepo<
    Entity,
    Config
  >['OnePlainEntityToBeUpdated'] &
    EntityRepoTypeParts<Entity, Config>['UpdatableRelationalPart'];

  SelectedOnePlainEntity: TypeormReturnTypeRequiredNullable<
    OmitIfProvidedKeysAreNotNull<
      EntityRepoTypeParts<Entity, Config>['PossiblyCanBeSelectedPlainPart'],
      Config['UnselectedByDefaultPlainKeys'],
      Entity
    >
  >;

  CreateOnePlainEntityFunctionType: <
    ProvidedPlainEntityToBeCreated extends PublicMethodTypesOfRepo<
      Entity,
      Config
    >['OnePlainEntityToBeCreated'],
  >(
    providedPlainEntityToBeCreated: ProvidedPlainEntityToBeCreated,
  ) => Promise<
    TypeormReturnTypeRequiredNullable<
      ProvidedPlainEntityToBeCreated &
        EntityRepoTypeParts<Entity, Config>['GeneratedPartAfterEntityCreation']
    >
  >;

  CreateManyPlainEntitiesFunctionType: <
    ProvidedPlainEntityToBeCreated extends PublicMethodTypesOfRepo<
      Entity,
      Config
    >['OnePlainEntityToBeCreated'],
  >(
    providedPlainEntitiesToBeCreated: ProvidedPlainEntityToBeCreated[],
  ) => Promise<
    TypeormReturnTypeRequiredNullable<
      ProvidedPlainEntityToBeCreated &
        EntityRepoTypeParts<Entity, Config>['GeneratedPartAfterEntityCreation']
    >[]
  >;

  UpdateOnePlainEntityFunctionType: <
    ProvidedUpdatedPart extends EntityRepoTypeParts<
      Entity,
      Config
    >['UpdatablePlainPart'],
  >(
    identity: EntityRepoTypeParts<
      Entity,
      Config
    >['IdentityPartRequiredForUpdateAndAlwaysSelected'],
    partToUpdate: ProvidedUpdatedPart,
  ) => Promise<
    TypeormReturnTypeRequiredNullable<
      EntityRepoTypeParts<
        Entity,
        Config
      >['IdentityPartRequiredForUpdateAndAlwaysSelected'] &
        ProvidedUpdatedPart
    >
  >;

  UpdateManyPlainEntitiesFunctionType: <
    ProvidedPlainEntityToBeUpdated extends PublicMethodTypesOfRepo<
      Entity,
      Config
    >['OnePlainEntityToBeUpdated'],
  >(
    providedPlainEntitiesToBeUpdated: ProvidedPlainEntityToBeUpdated[],
  ) => Promise<
    TypeormReturnTypeRequiredNullable<ProvidedPlainEntityToBeUpdated>[]
  >;
};

export type EntityRepoMethodTypesConfig<Entity extends Record<string, any>> = {
  EntityName: DBModelNames;
  RequiredToCreateAndSelectRegularPlainKeys: keyof Entity | null;
  OptionalToCreateAndSelectRegularPlainKeys: keyof Entity | null;

  ForbiddenToCreateGeneratedPlainKeys: keyof Entity | null;
  ForbiddenToUpdatePlainKeys: keyof Entity | null;
  ForbiddenToUpdateRelationKeys: keyof Entity | null;

  UnselectedByDefaultPlainKeys: keyof Entity | null;
};

type GetRelationPartBy<RelatedEntityName> =
  RelatedEntityName extends keyof RelationMap
    ? `I${RelatedEntityName}` extends keyof typeof model
      ? Pick<
          InstanceType<(typeof model)[`I${RelatedEntityName}`]>,
          //@ts-expect-error bug of typescript
          DeArrayOrFail<RelationMap[RelatedEntityName]['identityKeys']>
        >
      : never
    : never;

type OmitIfProvidedKeysAreNotNull<
  Holder,
  Keys extends keyof Entity | null,
  Entity extends Record<string, any>,
> = [Keys] extends [null]
  ? Holder
  : [Keys] extends [keyof Entity]
  ? Omit<Holder, Keys>
  : never;

export type TypeormReturnTypeRequiredNullable<T extends Record<string, any>> = {
  [Key in keyof T]-?: T extends {
    [KeyThatShouldBeDefined in Key]-?: Exclude<T[Key], null | undefined>;
  }
    ? Exclude<T[Key], null | undefined>
    : Exclude<T[Key], null | undefined> | null;
};

export type TypeormInputTypeNotRequiredNullable<T extends Record<string, any>> =
  {
    [Key in keyof T]+?: T extends {
      [KeyThatShouldBeDefined in Key]-?: Exclude<T[Key], null | undefined>;
    }
      ? Exclude<T[Key], null | undefined>
      : Exclude<T[Key], null | undefined> | null;
  };
