// @ts-strict

export function remapToIndexedObject<
  T extends Record<string, any>,
  E extends T[keyof T],
>(array: T[], getIndexKey: (element: T) => E): Record<E, T>;
export function remapToIndexedObject<
  T extends Record<string, any>,
  E extends T[keyof T],
  U extends T[keyof T],
>(
  array: T[],
  getIndexKey: (element: T) => E,
  getValueForKey: (element: T) => U,
): Record<E, U>;
export function remapToIndexedObject<
  T extends Record<string, any>,
  E extends T[keyof T],
  U extends T[keyof T],
>(
  array: T[],
  getIndexKey = (element: T): E => element['id'],
  getValueForKey: ((element: T) => U) | null = null,
) {
  if (getValueForKey === null) {
    const map: Record<E, T> = Object.create(null);

    for (const element of array) {
      map[getIndexKey(element)] = element;
    }

    return map;
  } else {
    const map: Record<E, U> = Object.create(null);

    for (const element of array) {
      map[getIndexKey(element)] = getValueForKey(element);
    }

    return map;
  }
}
