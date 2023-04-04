import type { Provider } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DI_TypedConfigService } from './di';
import { ConfigKeys } from './types';

@Injectable()
class TypedConfigService<Store extends Record<string, unknown>>
  implements DI_TypedConfigService<Store>
{
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

export const TypedConfigServiceProvider: Provider = {
  provide: DI_TypedConfigService,
  useClass: TypedConfigService,
};
