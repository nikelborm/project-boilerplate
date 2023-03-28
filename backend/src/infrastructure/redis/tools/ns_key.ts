import { RedisNamespaceEnum } from '../types';

export function ns_key(ns: RedisNamespaceEnum, key: string | number): string {
  return `${ns}:${key}`;
}
