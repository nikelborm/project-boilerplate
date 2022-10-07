import { DeepPartial, FindOptionsWhere } from 'typeorm';

export type ObjectWithNumberValuesAndKeysAs<Key extends string> = {
  [key in Key]: number;
};

export type SoftDeletingCriteria<T> = FindOptionsWhere<T>;

// magic, do not try to understand it, just hope it will work
type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;

type DoesKHaveOnlyOptionsPresentInKeysOfT<T, K extends string> = Equals<
  Exclude<K, keyof T>,
  never
>;

// eslint-disable-next-line @typescript-eslint/ban-types
type IsEmpty<T> = Equals<T, {}>;

type NotEmptyObject<T> = IsEmpty<T> extends true ? never : T;

type IsNotEqualByKeys<T, Keys> = Equals<keyof T, Keys> extends false
  ? true
  : false;

type NotEmptyEntityWithoutKeysGeneratedByDB<
  T,
  K extends string = 'id',
> = DoesKHaveOnlyOptionsPresentInKeysOfT<T, K> extends true
  ? IsNotEqualByKeys<T, K> extends true
    ? Omit<T, K>
    : never
  : never;

type NewEntityWhereNoNeedToRemoveGeneratedPartBecauseItDoesntExist<T> =
  DeepPartial<NotEmptyObject<T>>;

type NewEntityWhereWeWillRemoveGeneratedPart<
  T,
  KeysGeneratedByDB extends string,
> = DeepPartial<NotEmptyEntityWithoutKeysGeneratedByDB<T, KeysGeneratedByDB>>;

export type RemoveRelationalKeys<T> = {
  [K in keyof T as T[K] extends Array<any>
    ? never
    : T[K] extends Date
    ? K
    : T[K] extends Record<any, any>
    ? never
    : K]: T[K];
};

export type EntityDoesNotHaveGeneratedByDBFields =
  'entity does not have generated fields';

export type NewEntity<
  BaseEntity,
  KeysGeneratedByDB extends string = 'id', // otherwise declare keys
> = Equals<KeysGeneratedByDB, EntityDoesNotHaveGeneratedByDBFields> extends true
  ? NewEntityWhereNoNeedToRemoveGeneratedPartBecauseItDoesntExist<BaseEntity>
  : NewEntityWhereWeWillRemoveGeneratedPart<BaseEntity, KeysGeneratedByDB>;

export type NewPlainEntity<
  BaseEntity,
  KeysGeneratedByDB extends string = 'id',
> = NewEntity<RemoveRelationalKeys<BaseEntity>, KeysGeneratedByDB>;

export type CreatedEntity<
  BaseEntity,
  KeysGeneratedByDB extends string = 'id',
> = ObjectWithNumberValuesAndKeysAs<KeysGeneratedByDB> &
  Required<NewEntity<BaseEntity, KeysGeneratedByDB>>;

export type CreatedPlainEntity<
  BaseEntity,
  KeysGeneratedByDB extends string = 'id',
> = ObjectWithNumberValuesAndKeysAs<KeysGeneratedByDB> &
  Required<NewPlainEntity<BaseEntity, KeysGeneratedByDB>>;

export type UpdateEntity<
  BaseEntity,
  PrimaryKeys extends string = 'id',
> = DoesKHaveOnlyOptionsPresentInKeysOfT<BaseEntity, PrimaryKeys> extends true
  ? IsNotEqualByKeys<BaseEntity, PrimaryKeys> extends true
    ? IsEmpty<BaseEntity> extends false
      ? ObjectWithNumberValuesAndKeysAs<PrimaryKeys> &
          Omit<DeepPartial<BaseEntity>, PrimaryKeys>
      : never
    : never
  : never;

export type UpdatePlainEntity<
  BaseEntity,
  PrimaryKeys extends string = 'id',
> = UpdateEntity<RemoveRelationalKeys<BaseEntity>, PrimaryKeys>;

export type EntityAfterUpdate<
  BaseEntity,
  PrimaryKeys extends string = 'id',
> = Required<UpdateEntity<BaseEntity, PrimaryKeys>>;

export type PlainEntityAfterUpdate<
  BaseEntity,
  PrimaryKeys extends string = 'id',
> = Required<UpdatePlainEntity<BaseEntity, PrimaryKeys>>;
