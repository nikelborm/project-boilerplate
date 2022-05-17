import React, { useContext, useState } from 'react';
import { isValidSession } from 'utils';
import { ILocalStorageAuth, ISession } from 'types';

if (!getLocalStorageAuth()) {
  setLocalStorageAuth({
    isAuthed: false,
  });
}

const authedStateFromPreviousSession = getLocalStorageAuth();

const AuthContext = React.createContext(authedStateFromPreviousSession);
const AuthContextUpdater = React.createContext(
  null as unknown as React.Dispatch<React.SetStateAction<number>>,
);

export function useAuthedUser() {
  useContext(AuthContext);

  return getLocalStorageAuth() as ISession;
}

export function useAuthContextUpdater() {
  const refreshAuthContext = useContext(AuthContextUpdater);
  return {
    updateAuthContext(newSession: ISession) {
      const prevAuthState = getLocalStorageAuth();

      if (!isValidSession(newSession)) {
        throw new Error('You tried to set a bad auth context object');
      }

      setLocalStorageAuth(newSession);

      const areLocalStoragesEqual =
        JSON.stringify(prevAuthState) === JSON.stringify(getLocalStorageAuth());

      if (!areLocalStoragesEqual) {
        refreshAuthContext(Math.random());
      }
    },
  };
}

export function AuthContextProvider({ children }) {
  const setAuthContextState = useState(1)[1];

  return (
    <AuthContextUpdater.Provider value={setAuthContextState}>
      <AuthContext.Provider value={getLocalStorageAuth()}>
        {children}
      </AuthContext.Provider>
    </AuthContextUpdater.Provider>
  );
}

function setLocalStorageAuth(obj: ISession) {
  localStorage.setItem('auth', JSON.stringify(obj));
}

function getLocalStorageAuth() {
  let state: ILocalStorageAuth = null;
  try {
    state = JSON.parse(localStorage.getItem('auth') as string);
  } catch (error) {
    state = null;
  }
  return state;
}
