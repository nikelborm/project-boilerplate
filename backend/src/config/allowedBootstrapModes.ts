import { BootstrapMode } from './types';

export const allowedBootstrapModes: Set<BootstrapMode> = new Set(
  Object.values(BootstrapMode),
);
