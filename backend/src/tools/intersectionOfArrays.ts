export function intersection<T>(arrA: T[], arrB: T[]): Set<T> {
  const setA = new Set(arrA);

  const _intersection = new Set<T>();

  for (const elem of arrB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }

  return _intersection;
}

export const doesArraysIntersects = <T>(arrA: T[], arrB: T[]): boolean =>
  arrB.some((elem) => arrA.includes(elem));
