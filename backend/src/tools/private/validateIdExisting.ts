import { BadRequestException } from '@nestjs/common';

export const validateExistingId = <T extends Record<string, any>>(params: {
  entity?: T;
  entities?: T[];
  shouldIdExist: boolean;
  errorText: string;
}): void => {
  const shouldThrowError = <K extends Record<string, any>>(
    entity: K,
  ): boolean => (params.shouldIdExist ? !entity?.['id'] : !!entity?.['id']);

  if (params.entity) {
    if (shouldThrowError(params.entity))
      throw new BadRequestException(params.errorText);
    return;
  }

  if (params.entities?.some(shouldThrowError))
    throw new BadRequestException(params.errorText);
};
