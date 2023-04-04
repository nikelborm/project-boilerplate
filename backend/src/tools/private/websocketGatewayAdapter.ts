import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';
import type { IAppInitConfigMap, DI_TypedConfigService } from 'src/config';
import { ConfigKeys } from 'src/config';

// https://github.com/nestjs/nest/issues/5676#issuecomment-749719792
export class WebsocketGatewayAdapter extends IoAdapter {
  private readonly WEB_SOCKET_SERVER_PORT: number;

  private readonly WEB_SOCKET_SERVER_PATH: string;

  constructor(
    app: INestApplicationContext,
    configService: DI_TypedConfigService<IAppInitConfigMap>,
  ) {
    super(app);
    this.WEB_SOCKET_SERVER_PATH = configService.get(
      ConfigKeys.WEB_SOCKET_SERVER_PATH,
    );
    this.WEB_SOCKET_SERVER_PORT = configService.get(
      ConfigKeys.WEB_SOCKET_SERVER_PORT,
    );
  }

  override createIOServer(
    _: /* declaration of web socket port which we do ignore */ number,
    options?: ServerOptions & { namespace: string | RegExp },
  ): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = super.createIOServer(this.WEB_SOCKET_SERVER_PORT, {
      ...options,
      transports: ['websocket', 'polling'],
      path: this.WEB_SOCKET_SERVER_PATH,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (options?.namespace) return server.of(options.namespace);
    return server;
  }
}
