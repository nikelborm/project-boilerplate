export function groupBy<
  U extends string | number | symbol,
  T extends Record<U, any>,
>(items: T[], key: U): Record<U, T[]> {
  return items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item],
    }),
    Object.create(null),
  );
}
