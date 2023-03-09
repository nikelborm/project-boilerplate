import type { Repository } from 'typeorm';

export async function insertManyPlain<Out extends Record<string, any>>(
  repo: Repository<any>,
  newEntities: any[],
): Promise<Out[]> {
  const { generatedMaps } = await repo.insert(newEntities);
  if (newEntities.length !== generatedMaps.length)
    throw new Error(
      'insertManyPlain newEntities.length !== generatedMaps.length',
    );
  return newEntities.map((entity, index) => ({
    ...entity,
    ...generatedMaps[index],
  })) as Out[];
}

export async function insertOnePlain<Out extends Record<string, any>>(
  repo: Repository<any>,
  newEntity: unknown,
): Promise<Out> {
  const [returnedEntity] = await insertManyPlain(repo, [newEntity]);
  return returnedEntity as Out;
}
