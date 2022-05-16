import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ConfigService } from '@nestjs/config';
import { WsAdapter } from '@nestjs/platform-ws';
import { logConfig } from './tools';
import { ConfigKeys, IAppConfigMap } from './types';
import 'reflect-metadata';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MockDataUseCase } from './mock';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix('/api');

  const configService: ConfigService<IAppConfigMap, true> =
    app.get(ConfigService);

  logConfig(configService);

  const mode = configService.get(ConfigKeys.BOOTSTRAP_MODE, { infer: true });

  const markerFilePath = join(resolve(), 'wasMockScriptCalledOnStartup');

  const wasMockScriptCalledOnStartup = existsSync(markerFilePath);
  console.log('wasMockScriptCalledOnStartup: ', wasMockScriptCalledOnStartup);

  if (
    (mode === 'mock' || mode === 'mockAndEndpoints') &&
    !wasMockScriptCalledOnStartup
  ) {
    const mockUseCase = app.get(MockDataUseCase);

    const scriptName = configService.get(ConfigKeys.MOCK_SCRIPT_NAME, {
      infer: true,
    });

    if (!scriptName || !(scriptName in mockUseCase))
      throw new Error(`Script with name '${scriptName}' was not found`);

    console.log(`\n\n\nFILLING STARTED: ${scriptName}\n`);

    await mockUseCase[scriptName]();

    console.log('\nDATABASE FILLED SUCCESSFULLY\n\n\n');
    await writeFile(markerFilePath, '');
  }

  if (mode === 'endpoints' || mode === 'mockAndEndpoints') {
    const port = configService.get(ConfigKeys.SERVER_PORT, { infer: true });

    if (configService.get(ConfigKeys.IS_DEVELOPMENT, { infer: true })) {
      const config = new DocumentBuilder()
        .setTitle('Project API')
        .setVersion('1.0')
        .addBearerAuth()
        .setDescription(`Project API endpoints`)
        .build();

      const document = SwaggerModule.createDocument(app, config);

      SwaggerModule.setup('/docs', app, document);
    }

    app.useWebSocketAdapter(new WsAdapter(app));
    app.use(json({ limit: '3mb' }));
    app.use(urlencoded({ limit: '3mb', extended: true }));

    await app.listen(port);
  }
}

void bootstrap();
