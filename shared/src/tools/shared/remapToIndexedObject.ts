export function remapToIndexedObject<
  T extends Record<string, any>,
  E extends T[keyof T],
>(array: T[], getIndexKey?: (element: T) => E): Record<E, T>;
export function remapToIndexedObject<
  T extends Record<string, any>,
  E extends T[keyof T],
  U extends T[keyof T],
>(
  array: T[],
  getIndexKey?: (element: T) => E,
  getValueForKey?: (element: T) => U,
): Record<E, U>;
export function remapToIndexedObject<
  T extends Record<string, any>,
  E extends T[keyof T],
  U extends T[keyof T],
>(
  array: T[],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  getIndexKey = (element: T): E => element['id'],
  getValueForKey: ((element: T) => U) | null = null,
): Record<E, U | T> {
  if (getValueForKey === null) {
    const map = Object.create(null) as Record<E, T>;

    for (const element of array) {
      map[getIndexKey(element)] = element;
    }

    return map;
  }
  const map = Object.create(null) as Record<E, U>;

  for (const element of array) {
    map[getIndexKey(element)] = getValueForKey(element);
  }

  return map;
}
