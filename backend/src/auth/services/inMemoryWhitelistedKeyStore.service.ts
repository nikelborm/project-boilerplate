import { Injectable, Provider } from '@nestjs/common';
import { DI_WhitelistedSessionStore } from '../di';

@Injectable()
class InMemoryWhitelistedSessionStore implements DI_WhitelistedSessionStore {
  private store: Record<UserId, SerializedRefreshSessionEntries> =
    Object.create(null);

  async wasWhitelisted(userId: UserId, sessionUUID: string): Promise<boolean> {
    const entries = await this.getEntriesBy(userId);

    const findEntryBy = this.findEntryBy(entries);

    const { wasEntryFound } = findEntryBy(sessionUUID);

    return wasEntryFound;
  }

  async updateSessionsOf(
    userId: UserId,
    changes: {
      uuidOfSessionToRemove?: string;
      sessionToAdd?: Session;
    },
  ): Promise<void> {
    const entries = await this.getEntriesBy(userId);

    const findEntryBy = this.findEntryBy(entries);

    if (changes.uuidOfSessionToRemove) {
      const { wasEntryFound, index } = findEntryBy(
        changes.uuidOfSessionToRemove,
      );

      if (wasEntryFound) entries.splice(index, 1);
    }

    if (changes.sessionToAdd) {
      const { wasEntryFound } = findEntryBy(changes.sessionToAdd.uuid);

      if (!wasEntryFound) entries.push(changes.sessionToAdd);
    }

    await this.setEntriesBy(userId, entries);
  }

  async removeAllSessionsOf(userId: UserId): Promise<void> {
    // await this.setEntriesBy(userId, []);
    delete this.store[userId];
  }

  private async getEntriesBy(userId: UserId): Promise<Session[]> {
    return this.deserialize(this.store[userId] || '[]');
  }

  private findEntryBy(entries: Session[]) {
    return (
      uuidToSearch: string,
    ): {
      wasEntryFound: boolean;
      index: number;
    } => {
      const indexOfEntry = entries.findIndex(
        ({ uuid }) => uuid === uuidToSearch,
      );

      return {
        wasEntryFound: indexOfEntry !== -1,
        index: indexOfEntry,
      };
    };
  }

  private async setEntriesBy(
    userId: UserId,
    sessionEntries: Session[],
  ): Promise<void> {
    this.store[userId] = this.serialize(sessionEntries);
  }

  private serialize(
    sessionEntries: Session[],
  ): SerializedRefreshSessionEntries {
    return JSON.stringify(sessionEntries);
  }

  private deserialize(
    serializedSessionEntries: SerializedRefreshSessionEntries,
  ): Session[] {
    return JSON.parse(serializedSessionEntries).map(
      ({ expirationDate, uuid }: { expirationDate: string; uuid: string }) => ({
        uuid,
        expirationDate: new Date(expirationDate),
      }),
    );
  }

  // private clearExpiredWhitelistedSessions(): void {
  //   return;
  // }
}

type UserId = number;

type SerializedRefreshSessionEntries = string;

interface Session {
  uuid: string;
  expirationDate: Date;
}

export const InMemoryWhitelistedSessionStoreProvider: Provider = {
  provide: DI_WhitelistedSessionStore,
  useClass: InMemoryWhitelistedSessionStore,
};
