export const iterateInChunks = async <T>({
  chunkSize,
  array,
  callOnIteration,
  callAfterChunk,
}: {
  chunkSize: number;
  array: T[];
  callOnIteration: (element: T) => any;
  callAfterChunk: () => Promise<void> | void;
}): Promise<void> => {
  let chunkIndex = 0;

  const iterateInChunk = async (limit: number): Promise<void> => {
    for (let i = chunkIndex * chunkSize; i < limit; i++) {
      // TODO: Покрыть тестами, потому что ts говорит, что тут может быть проблема
      // @ts-expect-error TODO
      callOnIteration(array[i]);
    }
    await callAfterChunk();
  };

  for (; chunkIndex < Math.floor(array.length / chunkSize); chunkIndex++) {
    await iterateInChunk(chunkIndex * chunkSize + chunkSize);
  }

  if (chunkIndex * chunkSize < array.length) {
    await iterateInChunk(array.length);
  }
};
