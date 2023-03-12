export type DeArrayOrFail<T> = T extends readonly (infer U)[]
  ? U
  : T extends (infer P)[]
  ? P
  : never;

export type DeArray<T> = T extends readonly (infer U)[]
  ? U
  : T extends (infer P)[]
  ? P
  : never;
