import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from 'src/types';

export function logConfig(
  configService: ConfigService<Record<string, any>, true>,
): void {
  Object.values(ConfigKeys).forEach((key) =>
    console.log(`${key}: `, configService.get(key)),
  );
}
