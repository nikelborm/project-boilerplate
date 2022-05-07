import { QueryRunner } from 'typeorm';
import { iterateInChunks } from '.';

export async function insertInChunks<T>(
  queryRunner: QueryRunner,
  tableName: string,
  array: Record<string, T>[],
  getRowsToInsertFrom: (rowAsObject: Record<string, T>) => string[],
) {
  let rowsToInsert: string[] = [];

  await iterateInChunks({
    chunkSize: 50000,
    array,
    callOnIteration: (rowAsObject) => {
      rowsToInsert.push(...getRowsToInsertFrom(rowAsObject));
    },
    callAfterChunk: async () => {
      await queryRunner.query(
        `INSERT INTO "${tableName}" VALUES ${rowsToInsert}`,
      );
      rowsToInsert = [];
    },
  });
}
