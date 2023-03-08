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
  return groupByKeyGetter(items, (item) => item[key]);
}
