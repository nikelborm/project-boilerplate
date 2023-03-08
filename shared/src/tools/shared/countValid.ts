export const countValid = <T>(
  arr: T[],
  isValid: (elem: T, index?: number) => boolean,
): number =>
  arr.reduce(
    (acc, cur, curIndex) => (isValid(cur, curIndex) ? acc + 1 : acc),
    0,
  );
