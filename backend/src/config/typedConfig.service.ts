import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from './types';

@Injectable()
export class TypedConfigService<Store extends Record<string, unknown>> {
  constructor(private readonly configService: ConfigService<Store, true>) {}

  get<Key extends keyof Store>(propertyPath: Key): Store[Key] {
    return this.configService.get(propertyPath as any, {
      infer: true,
    });
  }

  logToConsole(): void {
    Object.values(ConfigKeys).forEach((key) =>
      console.log(`${key}: `, this.configService.get(key)),
    );
  }
}
