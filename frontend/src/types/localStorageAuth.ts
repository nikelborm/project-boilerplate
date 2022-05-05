export type ISession =
  | {
      isAuthed: true;
      authInfo: Record<string, any>;
    }
  | { isAuthed: false };

export type ILocalStorageAuth = ISession | null;
