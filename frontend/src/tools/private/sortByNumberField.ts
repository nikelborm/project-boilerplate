import type { KeysFilteredByValueType } from './KeysFilteredByValueType';

export function sortByNumberField<T extends Record<string, any>>(
  field: KeysFilteredByValueType<T, number>,
  arr: T[],
) {
  // eslint-disable-next-line security/detect-object-injection
  return [...arr].sort((a, b) => a[field] - b[field]);
}
