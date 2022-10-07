import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';

export const isQueryFailedError = (
  err: unknown,
): err is QueryFailedError & DatabaseError => err instanceof QueryFailedError;
