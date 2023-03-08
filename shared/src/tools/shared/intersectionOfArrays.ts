export function intersection<T>(arrA: T[], arrB: T[]): Set<T> {
  const setA = new Set(arrA);

  const intersectionSet = new Set<T>();

  for (const elem of arrB) {
    if (setA.has(elem)) {
      intersectionSet.add(elem);
    }
  }

  return intersectionSet;
}

export const doesArraysIntersects = <T>(arrA: T[], arrB: T[]): boolean =>
  arrB.some((elem) => arrA.includes(elem));
