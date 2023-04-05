/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { KeysFilteredByValueType } from './KeysFilteredByValueType';

export function sortByStringField<T extends Record<string, any>>(
  field: KeysFilteredByValueType<T, string>,
  arr: T[],
) {
  return [...arr].sort((a, b) => {
    // ignore upper and lowercase
    const nameA = a[field].toUpperCase();
    const nameB = b[field].toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });
}
