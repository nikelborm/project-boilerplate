/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';
import decodeJWT from 'jwt-decode';
import type { ISession } from '@/types';
import type { RefreshTokenDTO, AccessTokenDTO } from '@/types/shared';
import {
  AccessTokenPayloadDTO,
  RefreshTokenPayloadDTO,
  RefreshTokenPairRequestDTO,
  AuthTokenPairDTO,
} from '@/types/shared';
import { LOCAL_STORAGE_TOKEN_PAIR_KEY } from '@/constant';
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

  private lastTokenPairRefreshPromise: Promise<AuthTokenPairDTO | null> | null =
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
      this.lastTokenPairRefreshPromise = customFetch('auth/refresh', {
        needsJsonResponseBodyParsing: true,
        requestDTOclass: RefreshTokenPairRequestDTO,
        responseDTOClass: AuthTokenPairDTO,
        method: 'POST',
        needsAccessToken: false,

        body: {
          refreshToken: tokenPair.refreshToken,
        },
      })
        .then((newTokenPair) => {
          setTokenPair(newTokenPair);
          this.lastTokenPairRefreshPromise = null;
          return newTokenPair;
        })
        .catch((err: unknown) => {
          if (
            err &&
            err['message'] ===
            'Your session was finished because of long inactivity.\nIf you used your account on this device less than a week ago, your account may be hacked.\nTo be safe open your settings and click the "Logout on all devices" button'
          )
            updateTokenPair(null);
          // eslint-disable-next-line no-console
          console.log('Token pair refreshing was not successful', err);
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

export function updateTokenPair(tokenPair: AuthTokenPairDTO | null) {
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
  const [, rerenderSessionDependencies] = useState(1);

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

function setTokenPair(tokenPair: AuthTokenPairDTO | null): void {
  tokenPairUpdatingEventTarget.dispatchEvent(
    new Event(TOKEN_PAIR_UPDATED_EVENT),
  );

  if (!tokenPair) return localStorage.removeItem(LOCAL_STORAGE_TOKEN_PAIR_KEY);

  return localStorage.setItem(
    LOCAL_STORAGE_TOKEN_PAIR_KEY,
    JSON.stringify(tokenPair),
  );
}

//! uncomment in development. It will let you in without registration
// setTokenPair({
//   accessToken:
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uVVVJRCI6IjEyMzQ1Njc4OTAiLCJ1c2VyIjp7ImlkIjoxMjN9fQ.smJFD1t3LyPvSd2HAT09_se_cWlJ65CmUl1Xtc7TEM8',
//   refreshToken:
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uVVVJRCI6IjEyMzQ1Njc4OTAiLCJ1c2VyIjp7ImlkIjoxMjN9fQ.smJFD1t3LyPvSd2HAT09_se_cWlJ65CmUl1Xtc7TEM8',
// });

function getLastSavedTokenPair(): AuthTokenPairDTO | null {
  let tokenPair: AuthTokenPairDTO | null;
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

function convertTokenPairToSession(
  tokenPair: AuthTokenPairDTO | null,
): ISession {
  if (!tokenPair) return { isAuthed: false };

  const { payload: accessTokenPayload } = decodeJWT<AccessTokenDTO>(
    tokenPair.accessToken,
  );
  const { payload: refreshTokenPayload } = decodeJWT<RefreshTokenDTO>(
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

function getLastSavedSession() {
  return convertTokenPairToSession(getLastSavedTokenPair());
}

/* eslint-enable */
