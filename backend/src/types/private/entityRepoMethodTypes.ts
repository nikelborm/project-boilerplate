import type { RelationMap } from '../../types/private';
import type { DeArrayOrFail } from '../shared';
import type { DBModelNames } from './modelNames';
import type * as model from '../shared/model';

export type EntityRepoMethodTypes<
  Entity extends Record<string, any>,
  Config extends EntityRepoMethodTypesConfig<Entity>,
> = {
  //                                                             Reexport for easy access

  Config: Config;

  //                      Import left keys that came not from config but from RelationMap

  RelationKeys: keyof RelationMap[Config['EntityName']]['relationToEntityNameMap'];

  IdentityPlainKeys: DeArrayOrFail<
    RelationMap[Config['EntityName']]['identityKeys']
  >;

  //                         Little pieces which are part of final formatted object types

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

  UpdatablePlainPart: Partial<
    Config['ForbiddenToUpdatePlainKeys'] extends keyof Entity
      ? Omit<
          EntityRepoMethodTypes<Entity, Config>['RequiredToCreatePlainPart'] &
            EntityRepoMethodTypes<Entity, Config>['OptionalToCreatePlainPart'],
          Config['ForbiddenToUpdatePlainKeys']
        >
      : EntityRepoMethodTypes<Entity, Config>['RequiredToCreatePlainPart'] &
          EntityRepoMethodTypes<Entity, Config>['OptionalToCreatePlainPart']
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
    Config['ForbiddenToUpdateRelationKeys'] extends keyof Entity
      ? Omit<
          EntityRepoMethodTypes<
            Entity,
            Config
          >['PartWithRelationsOptimizedForUpdates'],
          Config['ForbiddenToUpdateRelationKeys']
        >
      : EntityRepoMethodTypes<
          Entity,
          Config
        >['PartWithRelationsOptimizedForUpdates']
  >;

  PossiblyCanBeSelectedPlainPart: EntityRepoMethodTypes<
    Entity,
    Config
  >['IdentityPartRequiredForUpdateAndAlwaysSelected'] &
    EntityRepoMethodTypes<Entity, Config>['OptionalToCreatePlainPart'] &
    EntityRepoMethodTypes<Entity, Config>['RequiredToCreatePlainPart'];

  //                                                       final types for repo functions

  OnePlainEntityToBeCreated: EntityRepoMethodTypes<
    Entity,
    Config
  >['RequiredToCreatePlainPart'] &
    EntityRepoMethodTypes<Entity, Config>['OptionalToCreatePlainPart'];

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

  SelectedOnePlainEntity: Config['UnselectedByDefaultPlainKeys'] extends keyof Entity
    ? Omit<
        EntityRepoMethodTypes<Entity, Config>['PossiblyCanBeSelectedPlainPart'],
        Config['UnselectedByDefaultPlainKeys']
      >
    : EntityRepoMethodTypes<Entity, Config>['PossiblyCanBeSelectedPlainPart'];
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
