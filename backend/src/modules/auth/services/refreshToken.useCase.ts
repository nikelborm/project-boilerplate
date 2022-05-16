import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRefreshTokenPayload } from '../types';
import { ConfigKeys, IAppConfigMap, UserAuthInfo } from 'src/types';

@Injectable()
export class RefreshTokenUseCase {
  private JWT_SECRET: string;

  constructor(
    private readonly configService: ConfigService<IAppConfigMap, true>,
  ) {
    this.JWT_SECRET = this.configService.get(ConfigKeys.JWT_SECRET);
  }

  getRefreshTokenPayload(
    user: UserAuthInfo,
    sessionUUID: string,
  ): UserRefreshTokenPayload {
    return {
      sessionUUID,
      user: {
        id: user.id,
      },
    };
  }
}
