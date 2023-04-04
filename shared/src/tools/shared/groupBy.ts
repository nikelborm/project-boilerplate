export function groupByKeyGetter<
  Item extends Record<string, any>,
  KeyGetterReturnValue,
>(
  items: Item[],
  groupingKeyGetter: (item: Item) => KeyGetterReturnValue,
): Map<KeyGetterReturnValue, Item[]> {
  const map = new Map<KeyGetterReturnValue, Item[]>();

  for (const item of items) {
    const groupingKey = groupingKeyGetter(item);
    const groupedValues = map.get(groupingKey);

    if (groupedValues) groupedValues.push(item);
    else map.set(groupingKey, [item]);
  }
  return map;
}

export function groupByKey<
  Item extends Record<string, any>,
  Key extends keyof Item,
>(items: Item[], key: Key): Map<Item[Key], Item[]> {
  if (['constructor', 'toString'].includes(key as unknown as string))
    throw new Error('Forbidden to use constructor key');
  return groupByKeyGetter(items, (item) => {
    // eslint-disable-next-line security/detect-object-injection
    const groupHeader = item[key];
    if (typeof groupHeader !== 'string' && typeof groupHeader !== 'number')
      throw new Error(
        'groupByKey keyGetter returns value that cannot be key (like null or undefined or object)',
      );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return groupHeader;
  });
}
