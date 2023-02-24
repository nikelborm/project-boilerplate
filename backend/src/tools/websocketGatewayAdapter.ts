import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { OnGatewayConnection } from '@nestjs/websockets';
import { ServerOptions } from 'socket.io';
import { ConfigKeys, IAppConfigMap, TypedConfigService } from 'src/config';

export class WebsocketGatewayAdapter
  extends IoAdapter
  implements OnGatewayConnection
{
  constructor(
    private app: INestApplicationContext,
    private readonly configService: TypedConfigService<IAppConfigMap>,
  ) {
    super(app);
  }

  handleConnection(client: unknown, ...args: any[]): void {
    console.log('client: any, ...args: ', client, args);
  }

  createIOServer(
    _: /* previously web socket port */ number,
    options?: ServerOptions,
  ): any {
    const server = super.createIOServer(
      this.configService.get(ConfigKeys.WEB_SOCKET_SERVER_PORT),
      {
        ...options,
        transports: ['websocket', 'polling'],
        path: `/${this.configService.get(ConfigKeys.WEB_SOCKET_SERVER_PATH)}`,
      },
    );
    return server;
  }
}
