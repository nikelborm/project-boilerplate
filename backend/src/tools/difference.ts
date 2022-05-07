export function differenceBetweenSetsInArray<T>(setA: Set<T>, setB: Set<T>) {
  const _difference = new Set(setA);

  for (const elem of setB) {
    _difference.delete(elem);
  }

  return [..._difference.values()];
}
