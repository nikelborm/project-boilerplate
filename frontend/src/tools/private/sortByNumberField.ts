import { KeysFilteredByValueType } from './KeysFilteredByValueType';

export function sortByNumberField<T extends Record<string, any>>(
  field: KeysFilteredByValueType<T, number>,
  arr: T[],
) {
  return [...arr].sort((a, b) => a[field] - b[field]);
}
