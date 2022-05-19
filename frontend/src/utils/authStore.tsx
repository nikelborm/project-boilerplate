/* eslint-disable react-hooks/rules-of-hooks */
import React, { useContext, useState } from 'react';
import decodeJWT from 'jwt-decode';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
  ISession,
  ITokenPair,
} from 'types';
import { LOCAL_STORAGE_TOKEN_PAIR_KEY } from 'constant';
// eslint-disable-next-line import/no-cycle
import { customFetch } from './customFetch';

const TokenPairUpdaterContext = React.createContext(
  (() => {}) as React.Dispatch<React.SetStateAction<number>>,
);

class AuthStore {
  constructor() {
    void this.requestTokenPairRefreshing();

    this.getAuthHeader.bind(this);
    this.requestTokenPairRefreshing.bind(this);
  }

  private lastTokenPairRefreshPromise: Promise<ITokenPair> | null = null;

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

  public async requestTokenPairRefreshing() {
    const tokenPair = getLastSavedTokenPair();

    if (!tokenPair) return null;

    const isItFunctionCallThatCausesRealFetch =
      !this.lastTokenPairRefreshPromise;

    if (isItFunctionCallThatCausesRealFetch) {
      this.lastTokenPairRefreshPromise = customFetch('auth/refresh', {
        method: 'POST',
        needsToken: false,
        body: {
          refreshToken: tokenPair.refreshToken,
        },
      });
      this.lastTokenPairRefreshPromise.catch((err) =>
        // eslint-disable-next-line no-console
        console.log('Token pair refreshing was not succesfull', err),
      );
    }

    const newTokenPair = await this.lastTokenPairRefreshPromise;

    if (isItFunctionCallThatCausesRealFetch) {
      setTokenPair(newTokenPair);
      this.lastTokenPairRefreshPromise = null;
    }

    return newTokenPair;
  }
}

export const authStore = new AuthStore();

const SessionContext = React.createContext(getLastSavedSession());

export function useSession() {
  return useContext(SessionContext);
}

export function useTokenPairUpdater() {
  const rerenderSessionDependencies = useContext(TokenPairUpdaterContext);

  return {
    requestTokenPairRefreshing: authStore.requestTokenPairRefreshing,
    updateTokenPair: (tokenPair: ITokenPair | null) => {
      const prevTokenPair = getLastSavedTokenPair();

      const areTokenPairsEqual =
        `${prevTokenPair?.accessToken}-${prevTokenPair?.refreshToken}` ===
        `${tokenPair?.accessToken}-${tokenPair?.refreshToken}`;

      if (!areTokenPairsEqual) {
        setTokenPair(tokenPair);
        rerenderSessionDependencies(Math.random());
      }
    },
  };
}

export function SessionProvider({ children }) {
  const rerenderSessionDependencies = useState(1)[1];

  return (
    <TokenPairUpdaterContext.Provider value={rerenderSessionDependencies}>
      <SessionContext.Provider value={getLastSavedSession()}>
        {children}
      </SessionContext.Provider>
    </TokenPairUpdaterContext.Provider>
  );
}

function setTokenPair(tokenPair: ITokenPair | null): void {
  if (!tokenPair) return localStorage.removeItem(LOCAL_STORAGE_TOKEN_PAIR_KEY);

  return localStorage.setItem(
    LOCAL_STORAGE_TOKEN_PAIR_KEY,
    JSON.stringify(tokenPair),
  );
}

function getLastSavedSession() {
  return convertTokenPairToSession(getLastSavedTokenPair());
}

function getLastSavedTokenPair(): ITokenPair | null {
  let tokenPair: ITokenPair | null;
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

function convertTokenPairToSession(tokenPair: ITokenPair | null): ISession {
  if (!tokenPair) return { isAuthed: false };

  const accessTokenPayload = decodeJWT<IAccessTokenPayload>(
    tokenPair.accessToken,
  );
  const refreshTokenPayload = decodeJWT<IRefreshTokenPayload>(
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
