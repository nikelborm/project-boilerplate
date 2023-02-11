/* eslint-disable max-classes-per-file */
import { plainToInstance, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
  validateSync,
  ValidationError,
} from 'class-validator';

const validateConfig = {
  validationError: {
    target: false,
  },
  stopAtFirstError: true,
  whitelist: true,
  forbidNonWhitelisted: true,
};

export class BaseMessageReport {
  @IsBoolean()
  isOk!: boolean;

  @IsOptional()
  @IsPositive()
  code?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class BaseMessage<T> {
  @IsDefined()
  @IsObject()
  payload!: T;

  @IsDefined()
  @ValidateNested()
  @Type(() => BaseMessageReport)
  report!: BaseMessageReport;
}

export function validate<P>(
  payload: P,
  payloadClass: { new (): P },
): ValidationError[] {
  const payloadInstance = plainToInstance(payloadClass, payload);
  return validateSync(payloadInstance as any, validateConfig);
}

export function validateWithBase<U>(
  entity: BaseMessage<U>,
  payloadClass: { new (): U },
): ValidationError[] {
  const baseMessageInstance = plainToInstance(BaseMessage, entity);
  const baseErrors = validateSync(baseMessageInstance as any, validateConfig);

  const payloadErrors = validate(entity.payload, payloadClass);

  return [...baseErrors, ...payloadErrors];
}
