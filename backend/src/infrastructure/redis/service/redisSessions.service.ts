import { Inject, Injectable, Provider } from '@nestjs/common';
import { DI_MASTER_REDIS_CLIENT } from '../di';
import { DI_RedisSessionsService } from '../di/redisSessions.service.di';
import { ns_key } from '../tools';
import {
  RedisClientTransactionBuilder,
  RedisMasterClient,
  RedisNamespaceEnum,
} from '../types';

@Injectable()
class RedisSessionsService implements DI_RedisSessionsService {
  constructor(
    @Inject(DI_MASTER_REDIS_CLIENT)
    private readonly masterClient: RedisMasterClient,
  ) {}

  async setNewSessionTokenPair({
    userId,
    sessionUUID,
    accessToken,
    refreshToken,
  }: {
    userId: number;
    sessionUUID: string;
    accessToken: string;
    refreshToken: string;
  }): Promise<void> {
    await this.getTokenPairSetter({
      sessionUUID,
      accessToken,
      refreshToken,
    })
      .sAdd(this.uiKey(userId), this.ssKey(sessionUUID))
      .expire(this.uiKey(userId), 604800) // 7 day = 60 * 60 * 24 * 7 = 604800
      .exec();
  }

  async updateTokenPair({
    sessionUUID,
    accessToken,
    refreshToken,
  }: {
    sessionUUID: string;
    accessToken: string;
    refreshToken: string;
  }): Promise<void> {
    await this.getTokenPairSetter({
      sessionUUID,
      accessToken,
      refreshToken,
    }).exec();
  }

  async finishSession({
    userId,
    sessionUUID,
  }: {
    userId: number;
    sessionUUID: string;
  }): Promise<void> {
    await this.masterClient
      .multi()
      .del(this.ssKey(sessionUUID))
      .sRem(this.uiKey(userId), this.ssKey(sessionUUID))
      .exec();
  }

  async finishAllSessions(userId: number): Promise<void> {
    const sessionUUIDs = await this.masterClient.sMembers(this.uiKey(userId));
    await this.masterClient.del([
      this.uiKey(userId),
      ...sessionUUIDs.map(this.ssKey),
    ]);
  }

  async resetAllAccessTokensOf(userId: number): Promise<void> {
    const sessionUUIDs = await this.masterClient.sMembers(this.uiKey(userId));
    let transactionBuilder = this.masterClient.multi();
    for (const sessionUUID of sessionUUIDs) {
      transactionBuilder = transactionBuilder.hDel(
        this.ssKey(sessionUUID),
        'access',
      );
    }
    await transactionBuilder.exec();
  }

  async getAllSessionsOf(
    userId: number,
  ): Promise<{ access?: string; refresh: string }[]> {
    const sessionUUIDs = await this.masterClient.sMembers(this.uiKey(userId));

    let transactionBuilder = this.masterClient.multi();

    for (const sessionUUID of sessionUUIDs) {
      transactionBuilder = transactionBuilder.hGetAll(this.ssKey(sessionUUID));
    }

    const weakTokenPairs = (await transactionBuilder.exec()) as ({
      access?: string; // can be optional because admin can revoke all access tokens when updating rights of user
      refresh: string;
    } | null)[]; // can be null in cases when some keys expired and were deleted

    return weakTokenPairs.filter(
      (tokenPair): tokenPair is { access?: string; refresh: string } =>
        !!tokenPair,
    );
  }

  async hasTokenBeenWhitelisted({
    userId,
    sessionUUID,
    token,
    tokenField,
  }: {
    userId: number;
    sessionUUID: string;
    token: string;
    tokenField: 'access' | 'refresh';
  }): Promise<boolean> {
    const [currentlyStoredToken, isSessionValid] = await this.masterClient
      .multi()
      .hGet(this.ssKey(sessionUUID), tokenField)
      .sIsMember(this.uiKey(userId), this.ssKey(sessionUUID))
      .exec();

    return currentlyStoredToken === token && !!isSessionValid;
  }

  private getTokenPairSetter({
    sessionUUID,
    accessToken,
    refreshToken,
  }: {
    sessionUUID: string;
    accessToken: string;
    refreshToken: string;
  }): RedisClientTransactionBuilder {
    return this.masterClient
      .multi()
      .hSet(this.ssKey(sessionUUID), {
        access: accessToken,
        refresh: refreshToken,
      })
      .expire(this.ssKey(sessionUUID), 604800); // 7 day = 60 * 60 * 24 * 7 = 604800
  }

  private uiKey = (userId: number): string =>
    ns_key(RedisNamespaceEnum.WHITELISTED_USER_ID_TO_SESSION_UUID, userId);

  private ssKey = (sessionUUID: string): string =>
    ns_key(
      RedisNamespaceEnum.WHITELISTED_USER_SESSION_UUID_TO_TOKEN_PAIR,
      sessionUUID,
    );
}

export const RedisSessionsServiceProvider: Provider = {
  provide: DI_RedisSessionsService,
  useClass: RedisSessionsService,
};
