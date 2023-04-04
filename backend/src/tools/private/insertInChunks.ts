import type { QueryRunner } from 'typeorm';
import { iterateInChunks } from '../shared';

export async function insertInChunks<T>(
  queryRunner: QueryRunner,
  tableName: string,
  array: Record<string, T>[],
  getRowsToInsertFrom: (rowAsObject: Record<string, T>) => string[],
): Promise<void> {
  let rowsToInsert: string[] = [];

  await iterateInChunks({
    chunkSize: 50000,
    array,
    callOnIteration: (rowAsObject) => {
      rowsToInsert.push(...getRowsToInsertFrom(rowAsObject));
    },
    callAfterChunk: async () => {
      await queryRunner.query(
        `INSERT INTO "${tableName}" VALUES ${rowsToInsert.join()}`,
      );
      rowsToInsert = [];
    },
  });
}
