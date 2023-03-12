import type * as SimplifiedModels from '../shared/model';

export type DBModelNames = WithoutFirstILetter<keyof typeof SimplifiedModels>;
export type DBModelInterfaceNames = keyof typeof SimplifiedModels;

type WithoutFirstILetter<ModelInterfaceName extends string> =
  ModelInterfaceName extends `I${infer ModelName}` ? ModelName : never;
