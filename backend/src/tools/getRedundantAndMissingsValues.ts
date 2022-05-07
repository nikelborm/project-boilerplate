import { differenceBetweenSetsInArray } from './difference';

export function getRedundantAndMissingsValues<T>(
  perfectSetOrArray: Set<T> | T[],
  checkableSetOrArray: Set<T> | T[],
) {
  const perfectSet = Array.isArray(perfectSetOrArray)
    ? new Set(perfectSetOrArray)
    : perfectSetOrArray;

  const checkableSet = Array.isArray(checkableSetOrArray)
    ? new Set(checkableSetOrArray)
    : checkableSetOrArray;

  const missingValues = differenceBetweenSetsInArray(perfectSet, checkableSet);

  const redundantValues = differenceBetweenSetsInArray(
    checkableSet,
    perfectSet,
  );

  return {
    missingValues,
    redundantValues,
    areThereAnyDifferences: !redundantValues.length && !missingValues.length,
  };
}
