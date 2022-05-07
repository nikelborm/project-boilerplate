import { DeepPartial, FindOptionsWhere } from 'typeorm';

export type EntityWithId = { id: number };

export type SoftDeletingCriteria<T> = FindOptionsWhere<T>;

export type UpdatedEntity<U extends EntityWithId> = DeepPartial<Omit<U, 'id'>> &
  EntityWithId;

export type NewEntity<U extends EntityWithId> = Omit<DeepPartial<U>, 'id'>;

export type PlainEntityWithoutId<U extends EntityWithId> = Omit<
  Partial<U>,
  'id'
>;
