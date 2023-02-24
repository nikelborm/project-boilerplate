import {
  ArgumentMetadata,
  HttpException,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { validationPipeConfig } from 'src/config';

export class WSMessageValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({ ...validationPipeConfig, ...options });
  }

  async transform(
    value: Record<any, any>,
    metadata: ArgumentMetadata,
  ): Promise<any> {
    try {
      return await super.transform(value, metadata);
    } catch (e: any) {
      if (e instanceof HttpException) {
        throw new WsException(e.getResponse());
      }
      throw e;
    }
  }
}
