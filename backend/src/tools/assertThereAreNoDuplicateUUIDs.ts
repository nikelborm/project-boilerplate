export function assertThereAreNoDuplicateUUIDs<T extends { uuid: string }>(
  entities: T[],
  entityName: string,
) {
  const entitiesUUIDs = entities.map(({ uuid }) => uuid);
  const entitiesUUIDsWithoutDuplicates = new Set(entitiesUUIDs);
  if (entitiesUUIDsWithoutDuplicates.size !== entitiesUUIDs.length)
    throw new Error(`You requested duplicate ${entityName}s uuids`);
}
