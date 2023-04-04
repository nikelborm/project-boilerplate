export type Merge<T> = { [P in keyof T]: T[P] };
