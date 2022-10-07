/* eslint-disable react-hooks/rules-of-hooks */
import React, { useContext, useEffect, useState } from 'react';
import decodeJWT from 'jwt-decode';
import { ISession } from 'types';
import {
  UserAccessTokenPayload,
  UserRefreshTokenPayload,
  TokenPairDTO,
} from 'backendTypes';
import { LOCAL_STORAGE_TOKEN_PAIR_KEY } from 'constant';
// eslint-disable-next-line import/no-cycle
import { customFetch } from './customFetch';

class AuthStore {
  constructor() {
    if (getLastSavedTokenPair()) {
      void this.requestTokenPairRefreshing();
      this.automaticTokenPairRefreshingInterval = setInterval(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.requestTokenPairRefreshing,
        19 * 60 * 1000, // every 19 minutes
      );
    }
  }

  private lastTokenPairRefreshPromise: Promise<TokenPairDTO | null> | null =
    null;

  private automaticTokenPairRefreshingInterval: NodeJS.Timer | undefined;

  public async getAuthHeader() {
    if (this.lastTokenPairRefreshPromise) {
      await this.lastTokenPairRefreshPromise;
    }

    const tokenPair = getLastSavedTokenPair();
    if (tokenPair) {
      return `Bearer ${tokenPair.accessToken}`;
    }
    throw new Error('You are not logged in');
  }

  public startTokenPairRefreshing() {
    this.stopTokenPairRefreshing();
    this.automaticTokenPairRefreshingInterval = setInterval(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.requestTokenPairRefreshing,
      19 * 60 * 1000, // every 19 minutes
    );
  }

  public stopTokenPairRefreshing() {
    if (this.automaticTokenPairRefreshingInterval)
      clearInterval(this.automaticTokenPairRefreshingInterval);
  }

  public async requestTokenPairRefreshing() {
    const tokenPair = getLastSavedTokenPair();

    if (!tokenPair) return null;

    if (!this.lastTokenPairRefreshPromise) {
      this.lastTokenPairRefreshPromise = customFetch<TokenPairDTO>(
        'auth/refresh',
        {
          method: 'POST',
          needsAccessToken: false,
          body: {
            refreshToken: tokenPair.refreshToken,
          },
        },
      )
        .then((newTokenPair) => {
          setTokenPair(newTokenPair);
          this.lastTokenPairRefreshPromise = null;
          return newTokenPair;
        })
        .catch((err) => {
          if (
            err?.message ===
            'Your session was finished because of long inactivity.\nIf you used your account less than a week ago, your account can be hacked.\nPlease open your settings and click the "Logout on all devices" button'
          )
            updateTokenPair(null);
          // eslint-disable-next-line no-console
          console.log('Token pair refreshing was not succesfull', err);
          return null;
        });
    }

    const newTokenPair = await this.lastTokenPairRefreshPromise;

    return newTokenPair;
  }
}

const tokenPairUpdatingEventTarget = new EventTarget();

const TOKEN_PAIR_UPDATED_EVENT = 'tokenPairUpdatedEvent';

export function addTokenPairUpdatedListener(cb: () => void) {
  tokenPairUpdatingEventTarget.addEventListener(TOKEN_PAIR_UPDATED_EVENT, cb);
}

export function removeTokenPairUpdatedListener(cb: () => void) {
  tokenPairUpdatingEventTarget.removeEventListener(
    TOKEN_PAIR_UPDATED_EVENT,
    cb,
  );
}

export const authStore = new AuthStore();

const SessionContext = React.createContext(getLastSavedSession());

export function useSession() {
  return useContext(SessionContext);
}

export function updateTokenPair(tokenPair: TokenPairDTO | null) {
  const prevTokenPair = getLastSavedTokenPair();

  const areTokenPairsEqual =
    `${prevTokenPair?.accessToken}-${prevTokenPair?.refreshToken}` ===
    `${tokenPair?.accessToken}-${tokenPair?.refreshToken}`;

  if (!areTokenPairsEqual) {
    if (tokenPair) {
      authStore.startTokenPairRefreshing();
    } else {
      authStore.stopTokenPairRefreshing();
    }
    setTokenPair(tokenPair);
  }
}

export function useTokenPairUpdater() {
  return {
    requestTokenPairRefreshing:
      authStore.requestTokenPairRefreshing.bind(authStore),
    updateTokenPair,
  };
}

export function SessionProvider({ children }) {
  const rerenderSessionDependencies = useState(1)[1];

  useEffect(() => {
    const handle = () => rerenderSessionDependencies(Math.random());

    addTokenPairUpdatedListener(handle);

    return function cleanup() {
      removeTokenPairUpdatedListener(handle);
    };
  }, []);

  return (
    <SessionContext.Provider value={getLastSavedSession()}>
      {children}
    </SessionContext.Provider>
  );
}

function setTokenPair(tokenPair: TokenPairDTO | null): void {
  tokenPairUpdatingEventTarget.dispatchEvent(
    new Event(TOKEN_PAIR_UPDATED_EVENT),
  );

  if (!tokenPair) return localStorage.removeItem(LOCAL_STORAGE_TOKEN_PAIR_KEY);

  return localStorage.setItem(
    LOCAL_STORAGE_TOKEN_PAIR_KEY,
    JSON.stringify(tokenPair),
  );
}

function getLastSavedSession() {
  return convertTokenPairToSession(getLastSavedTokenPair());
}

function getLastSavedTokenPair(): TokenPairDTO | null {
  let tokenPair: TokenPairDTO | null;
  try {
    tokenPair =
      JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_TOKEN_PAIR_KEY) as string,
      ) || null;
  } catch (error) {
    tokenPair = null;
  }
  return tokenPair;
}

function convertTokenPairToSession(tokenPair: TokenPairDTO | null): ISession {
  if (!tokenPair) return { isAuthed: false };

  const accessTokenPayload = decodeJWT<UserAccessTokenPayload>(
    tokenPair.accessToken,
  );
  const refreshTokenPayload = decodeJWT<UserRefreshTokenPayload>(
    tokenPair.refreshToken,
  );

  return {
    isAuthed: true,
    accessToken: {
      text: tokenPair.accessToken,
      payload: accessTokenPayload,
    },
    refreshToken: {
      text: tokenPair.accessToken,
      payload: refreshTokenPayload,
    },
  };
}
