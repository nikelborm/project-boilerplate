export function differenceBetweenSetsInArray<T>(
  setA: Set<T>,
  setB: Set<T>,
): T[] {
  const setOfElementsPresentInSetAButNotPresentInSetB = new Set(setA);

  for (const elem of setB) {
    setOfElementsPresentInSetAButNotPresentInSetB.delete(elem);
  }

  return [...setOfElementsPresentInSetAButNotPresentInSetB.values()];
}
