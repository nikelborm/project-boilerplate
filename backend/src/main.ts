import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
// import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import 'reflect-metadata';
import { AppModule } from './app.module';
import {
  BootstrapMode,
  ConfigKeys,
  IAppConfigMap,
  TypedConfigService,
} from './config';
import { MockDataUseCase } from './mock';

const SKIP_MOCK = true;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.setGlobalPrefix('/api');

  const configService: TypedConfigService<IAppConfigMap> =
    app.get(TypedConfigService);

  configService.logToConsole();

  const mode = configService.get(ConfigKeys.BOOTSTRAP_MODE);

  const markerFilePath = join(resolve(), 'wasMockScriptCalledOnStartup');

  // const wasMockScriptCalledOnStartup = false;
  const wasMockScriptCalledOnStartup = existsSync(markerFilePath);
  console.log('wasMockScriptCalledOnStartup: ', wasMockScriptCalledOnStartup);

  if (
    [BootstrapMode.MOCK, BootstrapMode.MOCK_AND_ENDPOINTS].includes(mode) &&
    !SKIP_MOCK &&
    !wasMockScriptCalledOnStartup
  ) {
    const mockUseCase = app.get(MockDataUseCase);

    const scriptName = configService.get(ConfigKeys.MOCK_SCRIPT_NAME);

    await mockUseCase.executeMock(scriptName);

    await writeFile(markerFilePath, '');
  }

  if (
    [BootstrapMode.ENDPOINTS, BootstrapMode.MOCK_AND_ENDPOINTS].includes(mode)
  ) {
    const port = configService.get(ConfigKeys.SERVER_PORT);

    if (configService.get(ConfigKeys.IS_DEVELOPMENT)) {
      const config = new DocumentBuilder()
        .setTitle('Project API')
        .setVersion('1.0')
        .addBearerAuth()
        .setDescription(`Project API endpoints`)
        .build();

      const document = SwaggerModule.createDocument(app, config);

      SwaggerModule.setup('/docs', app, document);
    }

    // app.useWebSocketAdapter(new WsAdapter(app));
    app.use(json({ limit: '3mb' }));
    app.use(urlencoded({ limit: '3mb', extended: true }));

    await app.listen(port);
  }
}

void bootstrap();
