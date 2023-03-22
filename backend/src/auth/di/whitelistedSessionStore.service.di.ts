export abstract class DI_WhitelistedSessionStore {
  abstract wasWhitelisted(
    userId: UserId,
    sessionUUID: string,
  ): Promise<boolean>;

  abstract updateSessionsOf(
    userId: UserId,
    changes: {
      uuidOfSessionToRemove?: string;
      sessionToAdd?: Session;
    },
  ): Promise<void>;

  abstract removeAllSessionsOf(userId: UserId): Promise<void>;
}

type UserId = number;

interface Session {
  uuid: string;
  expirationDate: Date;
}
