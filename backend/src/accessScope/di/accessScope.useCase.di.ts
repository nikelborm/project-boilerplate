import type { UpdateAccessScopeDTO } from 'src/types';

export abstract class DI_AccessScopeUseCase {
  abstract updateOne(accessScope: UpdateAccessScopeDTO): Promise<void>;
}
