export type Depromise<T> = T extends Promise<infer U> ? U : T;
