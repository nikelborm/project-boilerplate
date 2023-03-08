import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigKeys, IAppConfigMap, TypedConfigService } from 'src/config';

// https://github.com/nestjs/nest/issues/5676#issuecomment-749719792
export class WebsocketGatewayAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private readonly configService: TypedConfigService<IAppConfigMap>,
  ) {
    super(app);
  }

  createIOServer(
    _: /* declaration of web socket port which we do ignore */ number,
    options?: ServerOptions & { namespace: string | RegExp },
  ): any {
    const server = super.createIOServer(
      this.configService.get(ConfigKeys.WEB_SOCKET_SERVER_PORT),
      {
        ...options,
        transports: ['websocket', 'polling'],
        path: this.configService.get(ConfigKeys.WEB_SOCKET_SERVER_PATH),
      },
    );
    if (options?.namespace) return server.of(options.namespace);
    return server;
  }
}
