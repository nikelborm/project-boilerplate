import type { BasicUserInfoWithIdDTO } from '../../other/basicUserInfoWithId.dto';

export class FindManyUsersResponseDTO {
  users!: BasicUserInfoWithIdDTO[];
}
