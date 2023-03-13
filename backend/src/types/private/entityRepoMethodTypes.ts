import type { RelationMap } from '../../types/private';
import type { DeArrayOrFail } from '../shared';
import type { DBModelNames } from './modelNames';
import type * as model from '../shared/model';

export type EntityRepoMethodTypes<
  Entity extends Record<string, any>,
  Config extends EntityRepoMethodTypesConfig<Entity>,
> = {
  // ------------------------------------------------------------- Reexport for easy access

  Config: Config;

  // ---------------------- Import left keys that came not from config but from RelationMap

  RelationKeys: keyof RelationMap[Config['EntityName']]['relationToEntityNameMap'];

  IdentityPlainKeys: DeArrayOrFail<
    RelationMap[Config['EntityName']]['identityKeys']
  >;

  // ------------------------- Little pieces which are part of final formatted object types

  GeneratedPartAfterEntityCreation: Config['ForbiddenToCreateGeneratedPlainKeys'] extends keyof Entity
    ? Pick<Entity, Config['ForbiddenToCreateGeneratedPlainKeys']>
    : Record<never, never>;

  IdentityPartRequiredForUpdateAndAlwaysSelected: EntityRepoMethodTypes<
    Entity,
    Config
  >['IdentityPlainKeys'] extends keyof Entity
    ? Pick<Entity, EntityRepoMethodTypes<Entity, Config>['IdentityPlainKeys']>
    : never;

  RequiredToCreatePlainPart: Config['RequiredToCreateAndSelectRegularPlainKeys'] extends keyof Entity
    ? Pick<Entity, Config['RequiredToCreateAndSelectRegularPlainKeys']>
    : Record<never, never>;

  OptionalToCreatePlainPart: Config['OptionalToCreateAndSelectRegularPlainKeys'] extends keyof Entity
    ? Partial<Pick<Entity, Config['OptionalToCreateAndSelectRegularPlainKeys']>>
    : Record<never, never>;

  PartWithRequiredAndOptionalParts: EntityRepoMethodTypes<
    Entity,
    Config
  >['RequiredToCreatePlainPart'] &
    EntityRepoMethodTypes<Entity, Config>['OptionalToCreatePlainPart'];

  UpdatablePlainPart: Partial<
    OmitIfNotNull<
      EntityRepoMethodTypes<Entity, Config>['PartWithRequiredAndOptionalParts'],
      Config['ForbiddenToUpdatePlainKeys'],
      Entity
    >
  >;

  OriginalPartWithRelations: EntityRepoMethodTypes<
    Entity,
    Config
  >['RelationKeys'] extends keyof Entity
    ? Pick<Entity, EntityRepoMethodTypes<Entity, Config>['RelationKeys']>
    : Record<never, never>;

  PartWithRelationsOptimizedForUpdates: EntityRepoMethodTypes<
    Entity,
    Config
  >['RelationKeys'] extends keyof Entity
    ? {
        [RelationalKey in EntityRepoMethodTypes<
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
    OmitIfNotNull<
      EntityRepoMethodTypes<
        Entity,
        Config
      >['PartWithRelationsOptimizedForUpdates'],
      Config['ForbiddenToUpdateRelationKeys'],
      Entity
    >
  >;

  PossiblyCanBeSelectedPlainPart: EntityRepoMethodTypes<
    Entity,
    Config
  >['IdentityPartRequiredForUpdateAndAlwaysSelected'] &
    EntityRepoMethodTypes<Entity, Config>['PartWithRequiredAndOptionalParts'];

  // ------------------------------------------------------- final types for repo functions

  OnePlainEntityToBeCreated: OmitIfNotNull<
    EntityRepoMethodTypes<Entity, Config>['PartWithRequiredAndOptionalParts'],
    Config['ForbiddenToCreateGeneratedPlainKeys'],
    Entity
  >;

  // OneEntityWithRelationsToBeCreated should be disallowed

  OnePlainEntityToBeUpdated: EntityRepoMethodTypes<
    Entity,
    Config
  >['IdentityPartRequiredForUpdateAndAlwaysSelected'] &
    EntityRepoMethodTypes<Entity, Config>['UpdatablePlainPart'];

  OneEntityWithRelationsToBeUpdated: EntityRepoMethodTypes<
    Entity,
    Config
  >['OnePlainEntityToBeUpdated'] &
    EntityRepoMethodTypes<Entity, Config>['UpdatableRelationalPart'];

  SelectedOnePlainEntity: OmitIfNotNull<
    EntityRepoMethodTypes<Entity, Config>['PossiblyCanBeSelectedPlainPart'],
    Config['UnselectedByDefaultPlainKeys'],
    Entity
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

type OmitIfNotNull<
  Holder,
  Keys extends keyof Entity | null,
  Entity extends Record<string, any>,
> = [Keys] extends [null]
  ? Holder
  : [Keys] extends [keyof Entity]
  ? Omit<Holder, Keys>
  : never;
