import type { ArgumentMetadata, ValidationPipeOptions } from '@nestjs/common';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { validationPipeConfig } from 'src/config';

export class WSMessageValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({ ...validationPipeConfig, ...options });
  }

  override async transform(
    value: Record<any, any>,
    metadata: ArgumentMetadata,
  ): Promise<any> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await super.transform(value, metadata);
    } catch (e: any) {
      console.log('WSMessageValidationPipe error: ', e);
      if (e instanceof HttpException) {
        throw new WsException(e.getResponse());
      }
      throw e;
    }
  }
}
