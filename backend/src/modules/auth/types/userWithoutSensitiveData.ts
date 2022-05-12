import type { model } from 'src/modules/infrastructure';

export type UserWithoutSensitiveData = Omit<
  model.User,
  'passwordHash' | 'salt'
>;
