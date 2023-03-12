import type { DBModelNames } from './modelNames';
import type * as model from '../shared/model';

export type RelationMapMaximizedType = {
  [ModelName in DBModelNames]: `I${ModelName}` extends keyof typeof model
    ? {
        identityKeys: readonly (keyof InstanceType<
          (typeof model)[`I${ModelName}`]
        >)[];
        relationToEntityNameMap: {
          [RelationKey in keyof InstanceType<
            (typeof model)[`I${ModelName}`]
          >]?: DBModelNames | readonly [DBModelNames];
        };
      }
    : never;
};
