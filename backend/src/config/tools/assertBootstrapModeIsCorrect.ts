import { allowedBootstrapModes } from '../allowedBootstrapModes';
import { BootstrapMode } from '../types';

export function assertBootstrapModeIsCorrect(
  bootstrapMode?: string,
): asserts bootstrapMode is BootstrapMode {
  if (!bootstrapMode) throw new Error(`Bootstrap mode was not specified`);

  if (!allowedBootstrapModes.has(bootstrapMode as BootstrapMode))
    throw new Error(
      `'${bootstrapMode}' was not found in allowed bootstrap modes`,
    );
}
