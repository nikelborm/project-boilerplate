export function areSetsEqual<T>(firstSet: Set<T>, secondSet: Set<T>) {
  if (firstSet.size !== secondSet.size) return false;

  for (const elemFromFirstSet of firstSet)
    if (!secondSet.has(elemFromFirstSet)) return false;

  return true;
}
