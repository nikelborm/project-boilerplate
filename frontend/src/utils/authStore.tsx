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

class AuthStore {
  private readonly TokenPairUpdaterContext = React.createContext(
    (() => {}) as React.Dispatch<React.SetStateAction<number>>,
  );

  private readonly SessionContext = React.createContext(getLastSavedSession());

  private lastTokenPairRefreshPromise: Promise<ITokenPair> | null = null;

  public useSession() {
    return useContext(this.SessionContext);
  }

  public useTokenPairUpdater() {
    const rerenderSessionDependencies = useContext(
      this.TokenPairUpdaterContext,
    );

    return {
      requestTokenPairRefreshing: this.requestTokenPairRefreshing,
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

  public Provider({ children }) {
    const rerenderSessionDependencies = useState(1)[1];

    const TokenPairUpdaterProvider = this.TokenPairUpdaterContext.Provider;
    const SessionProvider = this.SessionContext.Provider;

    return (
      <TokenPairUpdaterProvider value={rerenderSessionDependencies}>
        <SessionProvider value={getLastSavedSession()}>
          {children}
        </SessionProvider>
      </TokenPairUpdaterProvider>
    );
  }

  public async getAuthHeader() {
    if (this.lastTokenPairRefreshPromise) {
      await this.lastTokenPairRefreshPromise;
    }

    const tokenPair = getLastSavedTokenPair();
    if (tokenPair) {
      return `Bearer ${tokenPair.accessToken}`;
    }
    throw new Error('Your session has been expired');
  }

  public async requestTokenPairRefreshing() {
    const tokenPair = getLastSavedTokenPair();

    if (!tokenPair) return null;

    if (!this.lastTokenPairRefreshPromise) {
      this.lastTokenPairRefreshPromise = customFetch('auth/refresh', {
        method: 'POST',
        needsToken: false,
        body: {
          refreshToken: tokenPair.refreshToken,
        },
      });

      this.lastTokenPairRefreshPromise.catch((err) =>
        console.log('Token pair refreshing was not succesfull', err),
      );
    }

    return await this.lastTokenPairRefreshPromise;
  }
}

export const authStore = new AuthStore();

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
