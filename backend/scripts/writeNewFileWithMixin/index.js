/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// @ts-check
import { readFile, writeFile } from 'fs/promises';

export const writeNewFileWithMixin = async (filename, mixin, regex) => {
  let tsFileContent = (await readFile(filename)).toString();

  let { index } = [...tsFileContent.matchAll(regex)][0];
  if (!index) throw new Error('regex was not found');

  const updatedFile = `${tsFileContent.slice(
    0,
    index,
  )}${mixin}${tsFileContent.slice(index)}`;

  await writeFile(filename, updatedFile);
};
