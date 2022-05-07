import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from 'src/types';

export function logConfig(
  configService: ConfigService<Record<string, any>, true>,
) {
  Object.keys(ConfigKeys).forEach((key) =>
    console.log(`${key}: `, configService.get(key)),
  );
}
