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
import * as MockServices from './mock';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const configService: ConfigService<IAppConfigMap, true> =
    app.get(ConfigService);

  logConfig(configService);

  const mode = configService.get(ConfigKeys.BOOTSTRAP_MODE, { infer: true });

  if (mode === 'mock' || mode === 'mockAndEndpoints') {
    console.log('MockServices: ', MockServices);
    // const mockUseCase = app.get(MockDataUseCase);
    // const scriptName = configService.get('mockDataFillerScriptMethodName');
    // if (!scriptName || !(scriptName in mockUseCase))
    //   throw new Error(`Script with name '${scriptName}' was not found`);
    // console.log(`\n\n\nfilling started: ${scriptName}\n`);
    // await mockUseCase[scriptName]();
    // console.log('DATABASE FILLED SUCCESSFULLY\n\n\n');
    // process.exit(0);
  }

  if (mode === 'endpoints' || mode === 'mockAndEndpoints') {
    const port = configService.get(ConfigKeys.SERVER_PORT, { infer: true });

    if (configService.get(ConfigKeys.IS_DEVELOPMENT, { infer: true })) {
      const config = new DocumentBuilder()
        .setTitle('Payless API')
        .setVersion('1.0')
        .addBearerAuth()
        .setDescription(
          `Надо учитывать то что я описал сущности наподобие того как они могут находиться в базе<br/>
          данных, то есть если ты дёрнешь какую-то ручку, то она вернёт тебе не все данные, которые<br/>
          есть в схеме. Это надо будет поправить и я поправлю`,
        )
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

bootstrap();