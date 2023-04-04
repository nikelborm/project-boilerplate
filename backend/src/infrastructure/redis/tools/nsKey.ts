import type { RedisNamespaceEnum } from '../types';

export function nsKey(ns: RedisNamespaceEnum, key: string | number): string {
  return `${ns}:${key}`;
}
