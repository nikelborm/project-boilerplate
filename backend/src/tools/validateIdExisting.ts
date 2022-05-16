import { BadRequestException } from '@nestjs/common';

export const validateExistingId = (params: {
  entity?: any;
  entities?: any[];
  shouldIdExist: boolean;
  errorText: string;
}): void => {
  const shouldThrowError = (entity: any): boolean =>
    params.shouldIdExist ? !entity?.id : !!entity?.id;

  if (params.entity) {
    if (shouldThrowError(params.entity))
      throw new BadRequestException(params.errorText);
    return;
  }

  if (params.entities?.some(shouldThrowError))
    throw new BadRequestException(params.errorText);
};
