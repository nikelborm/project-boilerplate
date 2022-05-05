import { ILocalStorageAuth } from 'types';

export function getLocalStorageAuth() {
  let state: ILocalStorageAuth = null;
  try {
    state = JSON.parse(localStorage.getItem('authed') as string);
  } catch (error) {
    state = null;
  }
  return state;
}
