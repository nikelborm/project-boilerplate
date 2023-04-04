import 'reflect-metadata';
import '@total-typescript/ts-reset';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import type { IAppInitConfigMap, ISecretConfigMap } from './config';
import { BootstrapMode, ConfigKeys, DI_TypedConfigService } from './config';
import { MockDataUseCase } from './mock';
import { WebsocketGatewayAdapter } from './tools';
import { ShutdownSignal } from '@nestjs/common';

const SKIP_MOCK = true;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    forceCloseConnections: true,
  });

  app.setGlobalPrefix('/api');

  const configService: DI_TypedConfigService<
    IAppInitConfigMap & ISecretConfigMap
  > = app.get(DI_TypedConfigService);

  if (configService.get(ConfigKeys.IS_DEVELOPMENT))
    configService.logToConsole();

  const mode = configService.get(ConfigKeys.BOOTSTRAP_MODE);

  const markerFilePath = join(resolve(), 'wasMockScriptCalledOnStartup');

  // const wasMockScriptCalledOnStartup = false;
  // eslint-disable-next-line security/detect-non-literal-fs-filename
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

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await writeFile(markerFilePath, '');
  }

  if (
    [BootstrapMode.ENDPOINTS, BootstrapMode.MOCK_AND_ENDPOINTS].includes(mode)
  ) {
    const port = configService.get(ConfigKeys.SERVER_PORT);

    if (
      configService.get(ConfigKeys.IS_DEVELOPMENT) ||
      configService.get(ConfigKeys.ENABLE_SWAGGER_IN_PROD)
    ) {
      const config = new DocumentBuilder()
        .setTitle('Project API')
        .setVersion('1.0')
        .addBearerAuth()
        .setDescription('Project API endpoints')
        .build();

      const document = SwaggerModule.createDocument(app, config);

      SwaggerModule.setup('/api/docs', app, document);
    }

    app.use(json({ limit: '3mb' }));
    app.use(urlencoded({ limit: '3mb', extended: true }));
    app.use(cookieParser(configService.get(ConfigKeys.COOKIE_SIGN_KEY_SECRET)));

    app.useWebSocketAdapter(new WebsocketGatewayAdapter(app, configService));
    app.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT]);
    await app.listen(port);
  }
}

void bootstrap();
